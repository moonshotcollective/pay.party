require("dotenv").config();
const ethers = require("ethers");
const express = require("express");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

// MY INFURA_ID, SWAP IN YOURS FROM https://infura.io/dashboard/ethereum
const INFURA_ID = process.env.INFURA_ID; //"460f40a260564ac4a4f4b3fffb032dad";
const PORT = process.env.PORT || 45622;
/// 📡 What chain are your contracts deployed to?

// const targetNetwork = {
//   name: "rinkeby",
//   color: "#e0d068",
//   chainId: 4,
//   rpcUrl: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
//   faucet: "https://faucet.rinkeby.io/",
//   blockExplorer: "https://rinkeby.etherscan.io/",
// };
// const targetNetwork = {
//     name: "mainnet",
//     color: "#ff8b9e",
//     chainId: 1,
//     rpcUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
//     blockExplorer: "https://etherscan.io/",
//   };
const targetNetwork = {
  name: "localhost",
  color: "#666666",
  chainId: 31337,
  blockExplorer: "",
  rpcUrl: "http://localhost:8545",
};

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
console.log("🏠 Connecting to provider:", localProviderUrl);
const localProvider = new ethers.providers.StaticJsonRpcProvider(
  localProviderUrl
);

const isElectionCandidates = async (candidatesToCheck, electionId) => {
  const providerNetwork = await localProvider.getNetwork();
  const _chainId = providerNetwork.chainId;

  contractList = require("./hardhat_contracts.json");
  console.log({ contractList });

  const contractData =
    contractList[_chainId][targetNetwork.name].contracts.Diplomat;
  const contract = new ethers.Contract(
    contractData.address,
    contractData.abi,
    localProvider
  );
  const [election] = await contract.functions.getElection(electionId);
  return election.candidates.every((candidate) =>
    candidatesToCheck.includes(candidate)
  );
};

const isAdmin = async (address) => {
  const providerNetwork = await localProvider.getNetwork();
  const _chainId = providerNetwork.chainId;

  contractList = require("./hardhat_contracts.json");

  const contractData =
    contractList[_chainId][targetNetwork.name].contracts.Diplomat;
  const contract = new ethers.Contract(
    contractData.address,
    contractData.abi,
    localProvider
  );

  const adminRole = await contract.DEFAULT_ADMIN_ROLE();
  const isAdmin = await contract.hasRole(adminRole, address);

  return isAdmin;
};

const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

//Uncomment this if you want to create a wallet to send ETH or something...
// const INFURA = JSON.parse(fs.readFileSync("./infura.txt").toString().trim())
// const PK = fs.readFileSync("./pk.txt").toString().trim()
// let wallet = new ethers.Wallet(PK,new ethers.providers.InfuraProvider("goerli",INFURA))
// console.log(wallet.address)
// const checkWalletBalance = async ()=>{
//   console.log("BALANCE:",ethers.utils.formatEther(await wallet.provider.getBalance(wallet.address)))
// }
// checkWalletBalance();

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
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/distributions", async function (request, response) {
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

  try {
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
    console.log(exception);
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
    console.log(exception);
    response.status(500).send("Error retrieving distributions");
  }
});

app.get("/currentDistribution", async function (request, response) {
  try {
    db.collection("distributions")
      .where("status", "==", "started")
      .get()
      .then((snapshot) => {
        if (!snapshot.empty) {
          data = {
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
    console.log(exception);
    response.status(500).send("Error retrieving current distribution");
  }
});

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
    console.log(exception);
    response.status(500).send("Error retrieving distributions");
  }
});

app.get("/distributions/:distributionId", async function (request, response) {
  const distributionRef = db
    .collection("distributions")
    .doc(request.params.distributionId);
  const distribution = await distributionRef.get();
  // console.log(distribution.data());
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

    const message =
      "qdip-vote-" + request.params.distributionId + request.body.address;
    console.log("Casting ballot to db", message);

    // sortedVotes.join() +
    // sortedVotes.map((voter) => request.body.votes[voter]).join();

    const recovered = ethers.utils.verifyMessage(
      message,
      request.body.signature
    );

    // console.log(recovered, request.body.address);

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
    console.log(request.params);
    const electionSnapshotRef = await db
      .collection("distributions")
      .doc(request.params.distributionId);

    const distribution = await electionSnapshotRef.get();
    console.log(distribution.data());
    if (!distribution) {
      return response.status(404).send("Distribution not found");
    }

    const { scores } = request.body;
    console.log({ scores });

    let votes = distribution.data().votes;

    let votesSignatures = distribution.data().votesSignatures;

    // TODO: Check if all votes are to members
    // const isValidBallot = await isElectionCandidates(
    //   request.body.candidates,
    //   request.params.distributionId
    // );
    // console.log(isValidBallot);
    // if (!isValidBallot) {
    //   return response.status(401).send("Invalid ballot");
    // }

    // TODO: Check if the total votes are equal or less than the vote allocation
    // const reducer = (previousValue, currentValue) =>
    //   previousValue + currentValue;
    // const totalVotes = Object.values(request.body.votes).reduce(reducer);
    // if (totalVotes > distribution.data().voteAllocation) {
    //   return response.status(401).send("More total votes than allowed");
    // }

    votes[recovered] = request.body.scores;
    votesSignatures[recovered] = request.body.signature;

    const res = await electionSnapshotRef.update({
      votes: votes,
      votesSignatures: votesSignatures,
    });

    return response.send({
      success: true,
      scores,
    });
  }
);

app.post(
  "/distributions/:distributionId/finish",
  async function (request, response) {
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

    // const electionSnapshot = await db
    //   .collection("distributions")
    //   .where("id", "==", parseInt(request.params.distributionId, 10))
    //   .get();
    // const distribution = electionSnapshot.docs[0];

    const electionSnapshotRef = await db
      .collection("distributions")
      .doc(request.params.distributionId);

    const distribution = await electionSnapshotRef.get();
    console.log(distribution.data());
    if (!distribution) {
      return response.status(404).send("Distribution not found");
    }
    if (!distribution) {
      return response.status(400).send("Distribution not found");
    } else {
      console.log(distribution.data());
      const distributionRef = distribution.ref;
      const res = await distributionRef.update({ active: false });

      return response.send(res);
    }
  }
);
app.post(
  "/distributions/:distributionId/pay",
  async function (request, response) {
    const electionSnapshotRef = await db
      .collection("distributions")
      .doc(request.params.distributionId);

    // console.log({ request });

    const distribution = await electionSnapshotRef.get();
    console.log(distribution);
    if (!distribution) {
      return response.status(404).send("Distribution not found");
    }
    if (!distribution) {
      return response.status(400).send("Distribution not found");
    } else {
      console.log(distribution.data());
      // const distributionRef = distribution.ref;
      const res = await distribution.ref.update({ paid: true });

      return response.send(res);
    }
  }
);

app.get("/distributions/ids/:ids", async (req, res, next) => {
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
});

app.get(
  "/distribution/state/:distributionId/:address",
  async (req, res, next) => {
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
  }
);

app.get("/distribution/:distributionId", async (req, res, next) => {
  const electionSnapshot = await db
    .collection("distributions")
    .where("id", "==", parseInt(req.params.distributionId, 10))
    .get();

  if (!electionSnapshot || !electionSnapshot.docs[0]) {
    return res.status(404);
  }
  const election = electionSnapshot.docs[0].data();
  return res.send({ election });
});

if (fs.existsSync("server.key") && fs.existsSync("server.cert")) {
  https
    .createServer(
      {
        key: fs.readFileSync("server.key"),
        cert: fs.readFileSync("server.cert"),
      },
      app
    )
    .listen(PORT, () => {
      console.log(`HTTPS Listening: ${PORT}`);
    });
} else {
  var server = app.listen(PORT, function () {
    console.log("HTTP Listening on port:", server.address().port);
  });
}
