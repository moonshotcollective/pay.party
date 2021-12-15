const mongoDB = require("mongodb");
const dotenv = require("dotenv");

const collections = {};
const connectToDatabase = async () => {
  dotenv.config();
  // Create a new MongoDB client with the connection string from .env
  const client = new mongoDB.MongoClient(process.env.DB_CONN_STRING);
  await client.connect();
  // Connect to the database with the name specified in .env
  const db = client.db(process.env.DB_NAME);
  // Apply schema validation to the collection
  await applySchemaValidation(db);
  const partyCollection = db.collection(process.env.PARTIES_COLLECTION_NAME);
  // Persist the connection to the party collection
  collections.parties = partyCollection;
  console.log(
    `Successfully connected to database: ${db.databaseName} and collection: ${partyCollection.collectionName}`
  );
};

// Update our existing collection with JSON schema validation so we know our documents will always match the shape of this model, even if added elsewhere.
async function applySchemaValidation(db) {
  const jsonSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "desc"],
      additionalProperties: false,
      properties: {
        _id: {},
        name: {
          bsonType: "string",
          description: "'name' is required and is a string",
        },
        desc: {
          bsonType: "string",
          description: "'desc' is required and is a string",
        },
        fund: {
          bsonType: "object",
          properties: {
            amount: {
              bsonType: "number",
            },
            token: {
              bsonType: "string",
            },
          },
        },
        strategy: {
          bsonType: "string",
          description: "'strategy' is a string",
        },
        participants: {
          bsonType: "array",
          description: "'participants' is a comma seperated string",
        },
        candidates: {
          bsonType: "array",
        },
        ballots: {
          bsonType: "array",
          description: "'ballots' is an array of ballot objects",
        },
      },
    },
  };

  // Try applying the modification to the collection, if the collection doesn't exist, create it
  await db
    .command({
      collMod: process.env.PARTIES_COLLECTION_NAME,
      validator: jsonSchema,
    })
    .catch(async (error) => {
      if (error.codeName === "NamespaceNotFound") {
        await db.createCollection(process.env.PARTIES_COLLECTION_NAME, {
          validator: jsonSchema,
        });
      }
    });
}

module.exports = {
  connectToDatabase: connectToDatabase,
  collections: collections,
};
