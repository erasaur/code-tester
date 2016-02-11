Template.challenges.onCreated(function () {
  var self = this;
  self._loaded = new ReactiveVar(0);
  self._limit = new ReactiveVar(10);

  self.autorun(function (computation) {
    var limit = self._limit.get();
    var sub = self.subscribe('challenges', limit);
    var fetched;

    if (sub.ready()) {
      fetched = Challenges.find().count();
      self._loaded.set(fetched);
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
    var whitelist = template.find('#whitelist').value;
    var blacklist = template.find('#blacklist').value;
    var structure = template.find('#structure').value;

    if (!title || !description || !instructions) {
      alert('Please fill in title, description, and instructions');
      return;
    }

    if (structure) {
      try {
        JSON.parse(structure);
      } catch (error) {
        alert('Please enter valid JSON for structure');
        return;
      }
    }

    var challenge = {
      title: title,
      description: description,
      instructions: instructions,
      answer: answer,
      whitelist: whitelist || '',
      blacklist: blacklist || '',
      structure: structure || ''
    };

    Meteor.call('createChallenge', challenge, function (error, result) {
      if (error) {
        if (_.isString(error.error)) {
          alert(error.reason);
        } else {
          alert('Oops, something went wrong. Please try again later!');
        }
      } else {
        Router.go('editor', { _id: result });
      }
    });
  }
});
