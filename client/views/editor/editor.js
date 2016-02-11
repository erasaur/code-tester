Template.editor.onCreated(function () {
  var self = this;
  // self._loading = new ReactiveVar(true);
  self._output = new ReactiveVar();
  self._feedback = new ReactiveVar();
  self._challengeId = Router.current().params._id;
  self.subscribe('challenge', self._challengeId);
});

Template.editor.onRendered(function () {
  var self = this;

  AceEditor.instance('editor', null, function (editor) {
    self._editor = editor;
    // self._loading.set(false);
    editor.setTheme('ace/theme/monokai');
    editor.getSession().setMode('ace/mode/javascript');
    editor.setValue('// Enter your solution to the challenge here!');
    editor.clearSelection();

    var tester = new CodeTester(editor);

    self.autorun(function () {
      var challenge = Challenges.findOne(self._challengeId);
      var requirements = challenge && challenge.requirements;

      if (requirements) {
        tester.whitelist(requirements.whitelist);
        tester.blacklist(requirements.blacklist);
        tester.structure(requirements.structure);
      }
    });

    tester.onTest(function (results) {
      self._feedback.set(results);
    });
  });
});

Template.editor.helpers({
  // 'loading': function () {
  //   var template = Template.instance();
  //   return template._loading.get();
  // },
  'challenge': function () {
    var template = Template.instance();
    return Challenges.findOne(template._challengeId);
  },
  'output': function () {
    var template = Template.instance();
    return template._output.get();
  },
  'feedback': function () {
    var template = Template.instance();
    return template._feedback.get();
  },
  'allGood': function () {
    var template = Template.instance();
    var feedback = template._feedback.get();
    return feedback && _.isEmpty(feedback);
  }
});

Template.editor.events({
  'click #js-run': function (event, template) {
    // TODO make sure eval is safe!
    // TODO doesn't check infinte loops!
    template._output.set(eval(template._editor.getValue()) || "No output -- did you forget to return?");
  }
});
