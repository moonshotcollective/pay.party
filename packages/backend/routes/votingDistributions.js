const express = require("express");
const db = require("../helpers/db");

const app = express.Router();

app.get("/votingDistributions/:voter", async function (request, response) {
  try {
    const snapshot = await db
      .collection("distributions")
      .where("members", "array-contains", request.params.voter)
      .get();

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

module.exports = app;
