// import express from "express";
// import cors from "cors";
// import { connectToDatabase } from "./services/databaseService";
// import { partyRouter } from "./routes/partyRouter";

let express = require("express");
let cors = require("cors");
let db = require("./services/databaseService");
let router = require("./routes/partyRouter");
const app = express();
const port = 8080; // default port to listen

db.connectToDatabase()
  .then(() => {
    app.use(
      cors({
        origin: function (origin, callback) {
          const validPatternRegexes = [
            // TODO: Add other hosts to valid patterns
            /^http:\/\/localhost:[0-9]{4}$/,
          ];
          if (validPatternRegexes.some((rx) => rx.test(origin)) || !origin) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
      })
    );

    // send all calls to /parties to our partyRouter
    app.use("/party", router.partyRouter);

    // start the Express server
    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed", err);
    process.exit();
  });
