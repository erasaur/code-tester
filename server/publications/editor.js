Meteor.publish('challenge', function (id) {
  check(id, String);
  return Challenges.find(id, { limit: 1 });
});
