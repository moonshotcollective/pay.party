const express = require("express");
const db = require("../helpers/db");

const app = express.Router();

app.get("/distribution/:distributionId", async (req, res) => {
  try {
    const electionSnapshot = await db
      .collection("distributions")
      .where("id", "==", parseInt(req.params.distributionId, 10))
      .get();

    if (!electionSnapshot || !electionSnapshot.docs[0]) {
      return res.status(404);
    }
    const election = electionSnapshot.docs[0].data();
    return res.send({ election });
  } catch (err) {
    console.error(err);
    return res.code(500).send();
  }
});

app.get(
  "/distribution/state/:distributionId/:address",
  async (req, res) => {
  try {
    const electionSnapshot = await db
      .collection("distributions")
      .doc(req.params.distributionId)
      .get();
    if (!electionSnapshot || !electionSnapshot.data()) {
      return res.status(404);
    }
    const election = electionSnapshot.data();
    const hasVoted = Object.keys(election.votes).some(
      (voterAddress) => voterAddress === req.params.address
    );
    const nVoted = Object.keys(election.votes).length;
    const isActive = election.active;
    return res.send({ hasVoted, isActive, nVoted });
  } catch (err) {
    console.error(err);
    return res.code(500).send();
  }
});

module.exports = app;
