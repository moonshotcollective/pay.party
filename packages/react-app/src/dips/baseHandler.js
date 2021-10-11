import axios from "axios";
import { makeCeramicClient } from "../helpers";
import qs from "query-string";
import { CERAMIC_PREFIX, serializeCeramicElection } from "./helpers";
var Map = require("collections/map");

export const serverUrl = process.env.REACT_APP_API_URL || "http://localhost:45622/";
export default function BaseHandler(tx, readContracts, writeContracts, mainnetProvider, address, userSigner) {
  console.log("BaseHandler()");
  const getElections = async () => {
    const contract = readContracts.Diplomat;
    const allContractElections = await contract.getElections();

    if (allContractElections.length == 0) {
      return [];
    }

    const ceramicElections = allContractElections.filter(d => {
      return d.startsWith(CERAMIC_PREFIX);
    });

    // const firebaseElectionIds = allContractElections.filter(d => {
    //   return !d.startsWith(CERAMIC_PREFIX);
    // });

    // const firebaseDbElections = (await axios.get(serverUrl + `distributions/`)).data;
    // // console.log(await firebaseDbElections);

    const newElectionsMap = new Map();
    // const formattedFirebaseElections = await Promise.all(
    //   firebaseDbElections.map(async fb => {
    //     const addressElectionState = await axios.get(serverUrl + `distribution/state/${fb.id}/${address}`);
    //     const hasVoted = addressElectionState.data.hasVoted;
    //     const nVoted = addressElectionState.data.nVoted;
    //     const isAdmin = address === fb.data.creator;
    //     const isCandidate = fb.data.candidates.includes(address);

    //     const tags = [];
    //     if (hasVoted) {
    //       tags.push("voted");
    //     }
    //     if (isAdmin) {
    //       tags.push("admin");
    //     }
    //     if (isCandidate) {
    //       tags.push("candidate");
    //     }

    //     const formattedElection = {
    //       ...fb.data,
    //       id: fb.id,
    //       created_date: new Date().toLocaleDateString(), // TODO: Update date
    //       n_voted: { n_voted: nVoted, outOf: fb.data.candidates.length },
    //       status: fb.data.active,
    //       tags: tags,
    //     };

    //     return formattedElection;
    //   }),
    // );
    // formattedFirebaseElections.forEach(({ id, ...election }) => {
    //   newElectionsMap.set(id, { id, ...election });
    // });

    for (let i = 0; i < ceramicElections.length; i++) {
      const serializedElection = await serializeCeramicElection(ceramicElections[i], address);
      newElectionsMap.set(ceramicElections[i], serializedElection);
    }

    return newElectionsMap;
  };

  return {
    getElections,
  };
}
