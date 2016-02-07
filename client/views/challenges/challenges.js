Template.challenges.onCreated(function () {
  var self = this;
  self._loaded = new ReactiveVar(0);
  self._limit = new ReactiveVar(10);

  self.autorun(function (computation) {
    var limit = self._limit.get();
    var sub = self.subscribe('challenges', limit);

    if (sub.ready()) {
      self._loaded.set(limit);
    }
  });
});

Template.challenges.helpers({
  challenges: function () {
    var loaded = Template.instance()._loaded.get();
    return Challenges.find({}, { limit: loaded });
  },
  showMore: function () {
    var loaded = Template.instance()._loaded.get();
    var fetched = Template.instance()._limit.get();
    return loaded >= fetched;
  }
});

Template.challenges.events({
  'click #js-show-more': function (event, template) {
    var curr = template._limit.get();
    template._limit.set(curr + 10);
  },
  'submit #challenge-create': function (event, template) {
    event.preventDefault();

    var title = template.find('#title').value;
    var description = template.find('#description').value;
    var instructions = template.find('#instructions').value;

    if (!title || !description || !instructions) {
      alert('Please fill in all the fields');
      return;
    }

    var challenge = {
      title: title,
      description: description,
      instructions: instructions
    };

    Meteor.call('createChallenge', challenge, function (error, result) {
      if (error) {
        if (typeof error.reason === 'string') {
          alert(error.error);
        } else {
          alert('Oops, something went wrong. Make sure you completed all fields!');
        }
      } else {
        Router.go('editor', { _id: result });
      }
    });
  }
});
