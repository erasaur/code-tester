Meteor.publish('challenge', function (id) {
  check(id, String);

  if (!this.userId) return;

  return Challenges.find(id, { limit: 1 });
});
