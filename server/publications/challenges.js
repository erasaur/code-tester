Meteor.publish('challenges', function (limit) {
  if (!this.userId) return;

  var challenges = Challenges.find({}, { sort: { 'createdAt': -1 }, limit: limit });

  var challengeIds = [];
  var userIds = [];

  challenges.forEach(function (challenge) {
    challengeIds.push(challenge._id);
    userIds.push(challenge.createdBy);
  });

  return [
    Challenges.find({ '_id': { $in: challengeIds } }, { fields: { title: 1, description: 1, createdAt: 1, createdBy: 1 } }),
    Meteor.users.find({ '_id': { $in: userIds } })
  ];
});
