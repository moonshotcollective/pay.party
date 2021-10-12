require("dotenv").config();
const express = require("express");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const routes = require("./routes");

app.use(
  cors({
    origin: function (origin, callback) {
      const validPatternRegexes = [
        /^(.*)qd-web-staging.herokuapp.com(\/(.*)|)$/,
        /^(www.|)qd-web-staging.herokuapp.com(\/(.*)|)$/,
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Function is not used!
// const isAdmin = async (address) => {
//   const providerNetwork = await localProvider.getNetwork();
//   const _chainId = providerNetwork.chainId;

//   const contractList = require("./hardhat_contracts.json");

//   const contractData =
//     contractList[_chainId][targetNetwork.name].contracts.Diplomat;
//   const contract = new ethers.Contract(
//     contractData.address,
//     contractData.abi,
//     localProvider
//   );

//   const adminRole = await contract.DEFAULT_ADMIN_ROLE();
//   const isAdmin = await contract.hasRole(adminRole, address);

//   return isAdmin;
// };

// app.get("/ownedDistributions/:owner", async function (request, response) {
//   try {
//     const snapshot = await db
//       .collection("distributions")
//       .where("owner", "==", request.params.owner)
//       .get();

//     let data = [];

//     snapshot.forEach((doc) => {
//       data.push({
//         id: doc.id,
//         data: doc.data(),
//       });
//     });

//     response.send(data);
//   } catch (exception) {
//     console.log(exception);
//     response.status(500).send("Error retrieving distributions");
//   }
// });

// const myCollectionDispose = await Promise.all(
//   acceptableIds.map(id => {
//     return db
//       .collection('myCollection')
//       .doc(id)
//       .onSnapshot(doSomething)
//   })
// )

app.use("/", routes);

const run = async () => {
  if (fs.existsSync("sslcert/server.key", "utf8") && fs.existsSync("sslcert/server.cert", "utf8")) {
    await https
      .createServer(
        {
          key: fs.readFileSync("sslcert/server.key"),
          cert: fs.readFileSync("sslcert/server.cert"),
        },
        app
      )
      .listen(process.env.PORT || 8443, () => {
        console.log(`HTTPS Listening on port: ${process.env.PORT || 8443}`);
      });
  } else {
    await app.listen(process.env.PORT || 8080, function () {
      console.log("HTTP Listening on port:", process.env.PORT || 8080);
    });
  }
}

run()
