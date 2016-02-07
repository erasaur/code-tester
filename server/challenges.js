Meteor.methods({
  'createChallenge': function (challenge) {
    check(challenge, {
      title: String,
      description: String,
      instructions: String,
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
    challenge.createdAt = new Date();
    challenge.createdBy = this.userId;
    challenge.requirements = {
      whitelist: challenge.whitelist.split(','),
      blacklist: challenge.blacklist.split(','),
      structure: challenge.structure
    };

    return Challenges.insert(challenge);
  }
});
