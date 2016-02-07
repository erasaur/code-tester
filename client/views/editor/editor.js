Template.editor.onCreated(function () {
  var self = this;
  self._loading = new ReactiveVar(true);
  self._challengeId = Router.current().params._id;
  self.subscribe('challenge', self._challengeId);
});

Template.editor.onRendered(function () {
  var self = this;

  AceEditor.instance('editor', null, function (editor) {
    self._loading.set(false);
    editor.setTheme('ace/theme/monokai');
    editor.getSession().setMode('ace/mode/javascript');
    editor.setValue('// Enter your solution to the challenge here!');
    editor.clearSelection();

    var tester = new CodeTester(editor);

    self.autorun(function () {
      var challenge = Challenges.findOne(self._challengeId);

      if (challenge) {
        tester.whitelist(challenge.whitelist);
        tester.blacklist(challenge.blacklist);
        tester.structure(challenge.structure);
      }
    });

    tester.onTest(function (results) {
      console.log(results);
    });
  });
});

Template.editor.helpers({
  'loading': function () {
    var template = Template.instance();
    return template._loading.get();
  },
  'challenge': function () {
    var template = Template.instance();
    return Challenges.findOne(template._challengeId);
  }
});

Template.editor.events({
  'click #js-run': function (event, template) {

  }
});
