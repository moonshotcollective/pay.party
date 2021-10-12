const express = require("express");
const ethers = require("ethers");
const db = require("../helpers/db");

const app = express.Router();

app.post("/distributions", async function (request, response) {
  try {
    console.log("IN DISTRIB", request.body.address, request.body.account);
    const ip =
      request.headers["x-forwarded-for"] || request.connection.remoteAddress;
    console.log("POST from ip address:", ip);

    // TODO: add some nonce to avoid replay attacks
    const message = "qdip-create-" + request.body.address;

    const recovered = ethers.utils.verifyMessage(message, request.body.signature);
    console.log({ recovered, bodyAddr: request.body.address, message });

    if (recovered != request.body.address) {
      console.log("Wrong signature");
      return response.status(401).send("Wrong signature");
    }

    const resAdd = await db.collection("distributions").add({
      name: request.body.name,
      creator: request.body.creator,
      candidates: request.body.candidates,
      fundAmount: request.body.fundAmount,
      tokenAdr: request.body.tokenAdr,
      voteAllocation: request.body.votes,
      kind: request.body.kind,
      owner: request.body.address,
      votes: {},
      active: true,
      paid: false,
      votesSignatures: {},
      signature: request.body.signature,
    });

    console.log({ resAdd });
    console.log(resAdd.id);
    return response.status(201).send({ electionId: resAdd.id });
  } catch (exception) {
    console.error(exception);
    return response.status(500).send("Error creating distribution");
  }
});

app.get("/distributions", async function (request, response) {
  try {
    const snapshot = await db.collection("distributions").get();

    let data = [];

    snapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        data: doc.data(),
      });
    });

    response.send(data);
  } catch (exception) {
    console.error(exception);
    response.status(500).send("Error retrieving distributions");
  }
});

app.get("/distributions/ids/:ids", async (req, res) => {
  try {
    console.log(req.body.firebaseElectionIds);
    const ids = req.params.ids.split(",");
    const electionSnapshotRefs = await Promise.all(
      ids.map((id) => {
        return db.collection("distributions").doc(id);
      })
    );
    console.log({ electionSnapshotRefs });
    const elections = await Promise.all(
      electionSnapshotRefs.map((ref) => {
        return ref.get();
      })
    );
    console.log({ elections });
    // await db
    //   .collection("distributions")
    //   .where("id", "array-contains", req.body.firebaseElectionIds)
    //   .get();
    if (elections.length === 0) {
      console.log("In if");
      return res.status(404);
    }

    let data = [];

    elections.forEach((doc) => {
      data.push({
        id: doc.id,
        createdAt: doc.createTime.toString(),
        data: doc.data(),
      });
    });
    console.log({ data });
    return res.send(data);
  } catch (err) {
    console.error(err);
    return res.code(500).send();
  }
});

module.exports = app;
