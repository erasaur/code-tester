CodeTester = (function () {
  // how long to wait after user has stopped typing
  // before beginning the tests
  var DEBOUNCE_MS = 500;

  function CodeTester (options) {
    if (!this instanceof CodeTester) {
      return new CodeTester(options);
    }

    if (options) {
      this.load(options);
    }
  }

  /**
   * Method that wraps CodeTester around an input element, so that it can
   * automatically hook into the input changes and apply tests automatically.
   * @param {Object} options A jQuery input or Ace Editor instance
   */
  CodeTester.prototype.load = function loadTester (options) {
    var lazyChange = _.bind(_.debounce(this.change, DEBOUNCE_MS), this);

    if ((typeof jQuery !== 'undefined') &&
        (options instanceof jQuery || _.isString(options))) {
      this._editor = $(options);
      this._boundEvent = this._editor.on('keyup.code_tester', lazyChange);
    }
    // assume ace editor instance
    else if (_.isFunction(options.getSession)) {
      this._editor = options.getSession();
      this._editor.on('change', lazyChange);
    }
    else {
      console.log('Unrecognized editor provided');
    }
  };

  /**
   * Test code based on given constraints. If not wrapping CodeTester around
   * an existing input element, contraints must be provided with the input;
   * namely, separate arrays containing whitelisted and blacklisted tokens,
   * as well as a JSON string representing a valid AST.
   * A codeString option must also be provided in the options object.
   * @param {Object} options Object containing constraints and code string
   */
  CodeTester.test = function testConstraints (options) {
    if (!_.isObject(options)) {
      console.log('CodeTester.test requires an options object');
      return;
    }
    if (!_.isString(options.codeString)) {
      console.log('CodeTester.test requires a codeString option');
      return;
    }
    var codeString = options.codeString;
    var whitelist = options.whitelist;
    var blacklist = options.blacklist;
    var structure = options.structure;
    var tokens = esprima.tokenize(options.codeString);
    var keywords = [];
    var result = {};
    var syntaxTree;

    _.each(tokens, function (token) {
      if (token.type === 'Keyword') {
        keywords.push(token.value);
      }
    });

    if (whitelist) {
      result.missing = CodeTester.testWhitelist(keywords, whitelist);
    }
    if (blacklist) {
      result.extra = CodeTester.testBlacklist(keywords, blacklist);
    }
    if (structure) {
      try {
        syntaxTree = esprima.parse(codeString);
        if (_.isString(structure)) {
          structure = JSON.parse(structure);
        }
        if (!CodeTester.testStructure(syntaxTree.body, structure)) {
          result.invalidStructure = true;
        }
      } catch (error) {
        console.log('error parsing codeString: ', error);
        console.log('codeString or structure has syntax errors, ' +
                    'skipping tests on structure.');
        result.invalidStructure = true;
      }
    }

    return result;
  };

  /**
   * Returns a list of tokens in whitelist but not in keywords.
   * @param {Object} keywords Array of tokens
   * @param {Object} whitelist Array of required tokens
   */
  CodeTester.testWhitelist = function testWhitelist (keywords, whitelist) {
    return _.difference(whitelist, keywords);
  };

  /**
   * Returns a list of tokens in blacklist and in keywords.
   * @param {Object} keywords Array of tokens
   * @param {Object} blacklist Array of forbidden tokens
   */
  CodeTester.testBlacklist = function testBlacklist (keywords, blacklist) {
    return _.intersection(blacklist, keywords);
  };

  /**
   * Traverses the given syntaxTree and checks if it matches the desired
   * structure. Set skipBlocks to true if BlockStatements are to be ignored
   * when matching.
   * @param {Object} syntaxTree Tree of the format returned by esprima.parse
   * @param {Object} structure JSON string of desired structure (AST format)
   * @param {Boolean} skipBlocks Whether or not to ignore BlockStatements when
   * traversing syntaxTree
   */
  CodeTester.testStructure = function testStructure (syntaxTree, structure, skipBlocks) {
    return CodeTester._traverseTree(syntaxTree, structure, true);
  };

  /**
   * Set whitelisted tokens, overriding the previous whitelist.
   * Should only be called when CodeTester is used as wrapper around input.
   * @param {Object} options A comma separated string, or array of strings
   */
  CodeTester.prototype.whitelist = function setWhitelist (options) {
    var self = this;
    self._whitelist = []; // reset

    if (_.isString(options)) {
      options = options.split(',');
    }
    _.each(options, function (option) {
      self._whitelist.push(option.trim());
    });
  };

  /**
   * Set blacklisted tokens, overriding the previous blacklist.
   * Should only be called when CodeTester is used as wrapper around input.
   * @param {Object} options A comma separated string, or array of strings
   */
  CodeTester.prototype.blacklist = function setBlacklist (options) {
    var self = this;
    self._blacklist = []; // reset

    if (_.isString(options)) {
      options = options.split(',');
    }
    _.each(options, function (option) {
      self._blacklist.push(option.trim());
    });
  };

  /**
   * Set desired structure, overriding the previous structure.
   * Should only be called when CodeTester is used as wrapper around input.
   * @param {Object} options A valid JSON object (or string)
   */
  CodeTester.prototype.structure = function setStructure (options) {
    var self = this;

    if (_.isString(options)) {
      try {
        self._structure = JSON.parse(options);
      } catch (error) {
        console.log('Invalid JSON provided!');
      }
    } else if (_.isObject(options)) {
      self._structure = options;
    }
  };

  /**
   * Get the current contents of the wrapped input element.
   * Should only be called when CodeTester is used as wrapper around input.
   */
  CodeTester.prototype.getValue = function getEditorContents () {
    if (_.isFunction(this._editor.getValue)) {
      return this._editor.getValue();
    }
    return this._editor.val();
  };

  /**
   * Re-runs tests whenever the input contents are changed.
   * Should only be called when CodeTester is used as wrapper around input.
   * @param {Object} event Javascript event object
   */
  CodeTester.prototype.change = function onChange (event) {
    var results = CodeTester.test({
      codeString: this.getValue(),
      whitelist: this._whitelist,
      blacklist: this._blacklist,
      structure: this._structure
    });

    if (_.isFunction(this._cb)) {
      this._cb(results);
    }
  };

  /**
   * Register a callback to be executed whenever change event fires.
   * Should only be called when CodeTester is used as wrapper around input.
   * @param {Function} cb Callback to register
   */
  CodeTester.prototype.onTest = function onTest (cb) {
    this._cb = cb;
  };

  /**
   * Unbind jQuery input listener.
   * Should only be called when CodeTester is used as wrapper around jQuery input.
   */
  CodeTester.stop = function stop () {
    if (this._boundEvent) {
      this._boundEvent.off('keyup.code_tester');
    }
  };

  /**
   * Internal method.
   * Gets the subTree of a given syntaxTree.
   * @param {Object} syntaxTree Tree of the format returned by esprima.parse
   */
  CodeTester._getSubTree = function getSubTree (syntaxTree) {
    return syntaxTree.body || syntaxTree.consequent;
  };

  /**
   * Internal method.
   * Attempt to match syntaxTree to the given structure with DFS. Returns true
   * if syntaxTree matches structure, false otherwise.
   * @param {Object} syntaxTree Tree of the format returned by esprima.parse
   * @param {Object} structure JSON string of desired structure (AST format)
   * @param {Boolean} skipBlocks Whether or not to ignore BlockStatements when
   * traversing syntaxTree
   */
  CodeTester._traverseTree = function traverseTree (syntaxTree, structure, skipBlocks) {
    // two empty trees match.
    if (!syntaxTree) {
      return !structure;
    }
    // empty structure always matches.
    if (!structure) {
      return true;
    }
    // if skipBlocks, ignore BlockStatements
    if (skipBlocks) {
      while (!_.isArray(syntaxTree)) {
        if (syntaxTree) {
          syntaxTree = CodeTester._getSubTree(syntaxTree);
        } else {
          return true;
        }
      }
    } else {
      if (!_.isArray(syntaxTree)) {
        syntaxTree = [syntaxTree];
      }
    }

    var desired = _.keys(structure);
    var found = [];

    // check every node of this level of the syntax tree
    for (var i = 0; i < syntaxTree.length; i++) {
      var currTree = syntaxTree[i];
      var currTreeType = currTree.type;
      var currStructure = structure[currTreeType];
      var subTree = CodeTester._getSubTree(currTree);

      if (CodeTester._traverseTree(subTree, currStructure, skipBlocks) ||
         (skipBlocks && CodeTester._traverseTree(subTree, structure, skipBlocks))) {
        found.push(currTreeType);
      }
    }

    // return true only if we've found everything we needed.
    return _.difference(desired, found).length === 0;
  };

  return CodeTester;
})();
