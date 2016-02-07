var ReqSchema = new SimpleSchema({
  whitelist: {
    type: [String]
  },
  blacklist: {
    type: [String]
  },
  structure: {
    type: String // JSON representation of general structure
  }
});

var ChallengeSchema = new SimpleSchema({
  createdAt: {
    type: Date
  },
  createdBy: {
    type: String
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  instructions: {
    type: String
  },
  htmlInstructions: {
    type: String
  },
  requirements: {
    type: ReqSchema
  }
});

Challenges = new Mongo.Collection('challenges');
Challenges.attachSchema(ChallengeSchema);
