import axios from "axios";
import { makeCeramicClient } from "../helpers";
import qs from "query-string";
import { CERAMIC_PREFIX, serializeCeramicElection } from "./helpers";
var Map = require("collections/map");

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

    const firebaseElectionIds = allContractElections.filter(d => {
      return !d.startsWith(CERAMIC_PREFIX);
    });

    const serverUrl = process.env.REACT_APP_API_URL || "http://localhost:45622/";

    const firebaseDbElections = (await axios.get(serverUrl + `distributions/`)).data;
    // console.log(await firebaseDbElections);

    const newElectionsMap = new Map();
    const formattedFirebaseElections = await Promise.all(
      firebaseDbElections.map(async fb => {

        const hasVoted = await axios.get(serverUrl + `distribution/state/${fb.id}/${address}`);

        const formattedElection = {
          id: fb.id,
          name: fb.data.name,
          description: fb.data.description,
          created_date: new Date().toLocaleDateString(),
          creator: fb.data.creator,
          status: fb.data.active,
          paid: fb.data.paid,
          n_voted: { n_voted: 1, outOf: fb.data.candidates.length },
          tags: ["admin"],
        };

        // console.log({ formattedElection });
        return formattedElection;
      }),
    );
    // console.log({ formattedFirebaseElections });
    formattedFirebaseElections.forEach(({ id, ...election }) => {
      newElectionsMap.set(id, election);
    });

    for (let i = 0; i < ceramicElections.length; i++) {
      const serializedElection = await serializeCeramicElection(ceramicElections[i], address);
      newElectionsMap.set(ceramicElections[i], serializedElection);
    }
    
    // console.log({ newElectionsMap });
    return newElectionsMap;
  };

  return {
    getElections,
  };
}
