const VoteSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Vote",
  type: "array",
  items: {
    type: "object",
    properties: {
      address: {
        type: "string",
        title: "address",
        maxLength: 42,
      },
      voteCount: {
        type: "integer",
        title: "voteCount",
      },
    },
  },
};

const VotesListSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "VotesList",
  type: "object",
  properties: {
    Votes: {
      type: "array",
      title: "votes",
      items: {
        type: "object",
        title: "VoteItem",
        properties: {
          id: {
            $ref: "#/definitions/CeramicStreamId",
          },
          name: {
            type: "string",
            title: "name",
            maxLength: 150,
          },
        },
      },
    },
  },
  definitions: {
    CeramicStreamId: {
      type: "string",
      pattern: "^ceramic://.+(\\\\?version=.+)?",
      maxLength: 150,
    },
  },
};
module.exports = {
  votes: VotesListSchema,
  vote: VoteSchema,
};
