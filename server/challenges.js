Meteor.methods({
  'createChallenge': function (challenge) {
    check(challenge, {
      title: String,
      description: String,
      instructions: String,
      answer: String,
      whitelist: String,
      blacklist: String,
      structure: String
    });

    if (!this.userId) {
      throw new Meteor.Error('error', 'Not logged in');
    }

    // make sure we have a valid JSON structure
    try {
      JSON.parse(challenge.structure);
    } catch (error) {
      throw new Meteor.Error('error', 'Invalid JSON structure');
    }

    challenge.htmlInstructions = marked(challenge.instructions);
    challenge.htmlAnswer = marked(challenge.answer);
    challenge.createdAt = new Date();
    challenge.createdBy = this.userId;
    challenge.requirements = {};

    // TODO improve this, add more checks
    _.each(['whitelist','blacklist'], function (req) {
      if (challenge[req]) {
        challenge.requirements[req] = [];
        _.each(challenge[req].split(','), function (elem) {
          challenge.requirements[req].push(elem.trim());
        });
      }
    });
    challenge.requirements.structure = challenge.structure || "";

    return Challenges.insert(challenge);
  }
});
