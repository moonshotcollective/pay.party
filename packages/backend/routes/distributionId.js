const express = require("express");
const ethers = require("ethers");
const db = require("../helpers/db");
const isElectionCandidates = require("../helpers/electionCandidate");

const app = express.Router();

app.get("/distributions/:distributionId", async function (request, response) {
  const distributionRef = db
    .collection("distributions")
    .doc(request.params.distributionId);
  const distribution = await distributionRef.get();
  console.log(distribution.data());
  if (!distribution) {
    return response.status(404).send("Distribution not found");
  } else {
    return response.send(distribution.data());
  }
});

app.post(
  "/distributions/:distributionId/vote",
  async function (request, response) {
    // const sortedVotes = Object.keys(request.body.votes).sort();
    try {
      const message =
        "qdip-vote-" + request.params.distributionId + request.body.address;
      console.log("Casting ballot to db", message);

      // sortedVotes.join() +
      // sortedVotes.map((voter) => request.body.votes[voter]).join();

      const recovered = ethers.utils.verifyMessage(
        message,
        request.body.signature
      );

      console.log(recovered, request.body.address);

      if (recovered !== request.body.address) {
        console.log("Wrong signature");
        return response.status(401).send("Wrong signature");
      }

      if (!request.params.distributionId) {
        return response.status(404).send("Distribution not found");
      }

      if (!request.body.candidates.includes(recovered)) {
        return response.status(401).send("Voter not allowed");
      }

      // save vote to db
      const electionSnapshot = await db
        .collection("distributions")
        .where("id", "==", parseInt(request.params.distributionId, 10))
        .get();
      const distribution = electionSnapshot.docs[0];
      console.log(distribution.data());
      const distributionRef = distribution.ref;

      const { scores } = request.body;

      let votes = distribution.data().votes;

      let votesSignatures = distribution.data().votesSignatures;

      // Check if all votes are to members
      const isValidBallot = await isElectionCandidates(
        request.body.candidates,
        request.params.distributionId
      );
      console.log(isValidBallot);
      if (!isValidBallot) {
        return response.status(401).send("Invalid ballot");
      }

      // TODO: Check if the total votes are equal or less than the vote allocation
      // const reducer = (previousValue, currentValue) =>
      //   previousValue + currentValue;
      // const totalVotes = Object.values(request.body.votes).reduce(reducer);
      // if (totalVotes > distribution.data().voteAllocation) {
      //   return response.status(401).send("More total votes than allowed");
      // }

      votes[recovered] = request.body.scores;
      votesSignatures[recovered] = request.body.signature;

      await distributionRef.update({
        votes: votes,
        votesSignatures: votesSignatures,
      });

      return response.send({
        success: true,
        scores,
      });
    } catch (err) {
      console.log(err);
      return response.code(500).send(err);
    }
});

app.post(
  "/distributions/:distributionId/finish",
  async function (request, response) {
    try {
      const message =
        "qdip-finish-" + request.params.distributionId + request.body.address;
      console.log({ message });

      // const recovered = ethers.utils.verifyMessage(
      //   message,
      //   request.body.signature
      // );

      // console.log(recovered);

      // if (recovered != request.body.address) {
      //   console.log("Wrong signature");
      //   return response.status(401).send("Wrong signature");
      // }

      // const isAdminInContract = await isAdmin(recovered);
      // if (!isAdminInContract) {
      //   console.log("No admin in contract");
      //   return response.status(401).send("No admin in contract");
      // }

      const electionSnapshot = await db
        .collection("distributions")
        .where("id", "==", parseInt(request.params.distributionId, 10))
        .get();
      const distribution = electionSnapshot.docs[0];

      if (!distribution.exists) {
        return response.status(400).send("Distribution not found");
      } else {
        console.log(distribution.data());
        const distributionRef = distribution.ref;
        const res = await distributionRef.update({ active: false });

        return response.send(res);
      }
    } catch (err) {
      console.error(err);
      return response.status(500).send(err);
    }
  });

module.exports = app;
