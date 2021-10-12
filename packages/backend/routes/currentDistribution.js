const express = require("express");
const db = require("../helpers/db");

const app = express.Router();

app.get("/currentDistribution", async function (request, response) {
  try {
    db.collection("distributions")
      .where("status", "==", "started")
      .get()
      .then((snapshot) => {
        if (!snapshot.empty) {
          const data = {
            id: snapshot.docs[0].id,
            data: snapshot.docs[0].data(),
          };
          console.log(data);
          response.send(data);
        } else {
          response.status(404).send("No current distribution");
        }
      });
  } catch (exception) {
    console.error(exception);
    response.status(500).send("Error retrieving current distribution");
  }
});

module.exports = app;
