const mongoDB = require("mongodb");
const db = require("../services/databaseService");
const express = require("express");

const partyRouter = express.Router();
partyRouter.use(express.json());
partyRouter.get("/", async (_req, res) => {
  try {
    // Call find with an empty filter object, meaning it returns all documents in the collection. Saves as party array to take advantage of types
    const parties = await db.collections.parties.find({}).toArray();

    res.status(200).send(parties);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Example route: http://localhost:8080/party/610aaf458025d42e7ca9fcd0
partyRouter.get("/:id", async (req, res) => {
  const id = req?.params?.id;

  try {
    // _id in MongoDB is an objectID type so we need to find our specific document by querying
    const query = { _id: new mongoDB.ObjectId(id) };
    const party = await db.collections.parties.findOne(query);
    if (party) {
      res.status(200).send(party);
    }
  } catch (error) {
    res
      .status(404)
      .send(`Unable to find matching document with id: ${req.params.id}`);
  }
});

partyRouter.post("/", async (req, res) => {
  console.log("partyRouter POST!");
  try {
    console.log(req.body);
    const newParty = req.body;
    const result = await db.collections.parties.insertOne(newParty);
    result
      ? res
          .status(201)
          .send(`Successfully created a new party with id ${result.insertedId}`)
      : res.status(500).send("Failed to create a new party.");
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

partyRouter.put("/:id", async (req, res) => {
  const id = req?.params?.id;

  try {
    const updatedParty = req.body;
    const query = { _id: new mongoDB.ObjectId(id) };
    // $set adds or updates all fields
    const result = await db.collections.parties.updateOne(query, {
      $set: updatedParty,
    });

    result
      ? res.status(200).send(`Successfully updated party with id ${id}`)
      : res.status(304).send(`Party with id: ${id} not updated`);
  } catch (error) {
    console.error(error.message);
    res.status(400).send(error.message);
  }
});

partyRouter.delete("/:id", async (req, res) => {
  const id = req?.params?.id;
  try {
    const query = { _id: new mongoDB.ObjectId(id) };
    const result = await db.collections.parties.deleteOne(query);
    if (result && result.deletedCount) {
      res.status(202).send(`Successfully removed party with id ${id}`);
    } else if (!result) {
      res.status(400).send(`Failed to remove party with id ${id}`);
    } else if (!result.deletedCount) {
      res.status(404).send(`Party with id ${id} does not exist`);
    }
  } catch (error) {
    console.error(error.message);
    res.status(400).send(error.message);
  }
});

module.exports = {
  partyRouter: partyRouter,
};
