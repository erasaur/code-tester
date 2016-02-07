Template.editor.onCreated(function () {
  this._loading = new ReactiveVar(true);
});

Template.editor.onRendered(function () {
  var self = this;

  AceEditor.instance('editor', null, function (editor) {
    self._loading.set(false);
    editor.setTheme('ace/theme/monokai');
    editor.getSession().setMode('ace/mode/javascript');
    editor.setValue('// Enter your solution to the challenge here!');
    editor.clearSelection();
  });
});

Template.editor.helpers({
  'loading': function () {
    var template = Template.instance();
    return template._loading.get();
  }
});
