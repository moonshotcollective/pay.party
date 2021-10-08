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
          electionId: {
            $ref: "#/definitions/CeramicStreamId",
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

const ElectionSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Election",
  type: "object",
  properties: {
    createdAt: {
      type: "string",
      format: "date-time",
      maxLength: 30,
    },
    description: {
      type: "string",
      title: "description",
      maxLength: 450,
    },
    kind: {
      type: "string",
      title: "kind",
      maxLength: 150,
    },
    voteAllocation: {
      type: "integer",
      title: "voteAllocation",
    },
    fundAmount: {
      type: "string",
      title: "fundAmount",
    },
    tokenAddress: {
      type: "string",
      maxLength: 42,
      title: "tokenAddress",
    },
    isActive: {
      type: "boolean",
      title: "isActive",
    },
    isPaid: {
      type: "boolean",
      title: "isPaid",
    },
  },
};

const ElectionsListSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "ElectionsList",
  type: "object",
  properties: {
    Elections: {
      type: "array",
      title: "elections",
      items: {
        type: "object",
        title: "ElectionItem",
        properties: {
          id: {
            $ref: "#/definitions/CeramicStreamId",
          },
          name: {
            type: "string",
            title: "name",
            maxLength: 150,
          },
          candidates: {
            type: "array",
            items: {
              type: "string",
              maxLength: 42,
            },
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
  elections: ElectionsListSchema,
  election: ElectionSchema,
};
