var parser = Npm.require('esprima');

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

  CodeTester.prototype.load = function (options) {
    if ((typeof jQuery !== 'undefined') &&
        (options instanceof jQuery || _.isString(options))) {
      this._editor = $(options);
      this._boundEvent = this._editor.on('keyup.code_tester', this.change);
    }
    // assume ace editor instance
    else if (_.isFunction(options.getSession)) {
      this._editor = options.getSession();
      this._editor.on('change', this.change);
    }
    else {
      console.log('Unrecognized editor provided');
    }
  };

  CodeTester.test = function (options) {
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
    var tokens = esprima.tokenize(codeString);
    var keywords = [];
    var result = {};
    var syntaxTree;

    _.each(tokens, function (token) {
      if (token.type === 'Keyword') {
        keywords.push[token.value];
      }
    });

    if (whitelist) {
      result.missing = CodeTester.testWhitelist(tokens, whitelist);
    }
    if (blacklist) {
      result.extra = CodeTester.testBlacklist(tokens, blacklist);
    }
    if (structure) {
      syntaxTree = esprima.parse(codeString);
      result.invalidStructure = CodeTester.testStructure(syntaxTree, structure);
    }

    return result;
  };

  CodeTester.testWhitelist = function testWhitelist (tokens, whitelist) {
    return _.without(whitelist, values);
  };

  CodeTester.testBlacklist = function testBlacklist (tokens, blacklist) {
    return _.intersection(blacklist, values);
  };

  CodeTester.testStructure = function testStructure (syntaxTree, structure) {
    // TODO
  };

  CodeTester.prototype.whitelist = function (options) {
    var self = this;
    self._whitelist = []; // reset

    if (_.isString(options)) {
      options = options.split(',');
    }
    _.each(options, function (option) {
      self._whitelist.push(option.trim());
    });
  };

  CodeTester.prototype.blacklist = function (options) {
    var self = this;
    self._blacklist = []; // reset

    if (_.isString(options)) {
      options = options.split(',');
    }
    _.each(options, function (option) {
      self._blacklist.push(option.trim());
    });
  };

  CodeTester.prototype.structure = function (options) {
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

  CodeTester.prototype.getValue = function () {
    if (_.isFunction(this._editor.getValue)) {
      return this._editor.getValue();
    }
    return this._editor.val();
  };

  CodeTester.prototype.change = _.debounce(function (event) {
    var results = CodeTester.test({
      codeString: this.getValue(),
      whitelist: this._whitelist,
      blacklist: this._blacklist,
      structure: this._structure
    });

    if (_.isFunction(this._cb)) {
      this._cb(results);
    }
  }, DEBOUNCE_MS);

  CodeTester.prototype.onTest = function (cb) {
    this._cb = cb;
  };

  CodeTester.stop = function () {
    if (this._boundEvent) {
      this._boundEvent.off('keyup.code_tester');
    }
  };

  return CodeTester;
})();
