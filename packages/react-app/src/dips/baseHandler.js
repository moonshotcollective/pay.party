import axios from "axios";
import { makeCeramicClient } from "../helpers";
import qs from "query-string";
import { CERAMIC_PREFIX, serializeCeramicElection } from "./helpers";
export const serverUrl = process.env.REACT_APP_API_URL || "http://localhost:45622/";

export default function BaseHandler(tx, readContracts, writeContracts, mainnetProvider, address, userSigner) {
  const getElections = async () => {
    const contract = readContracts.Diplomat;
    const allElections = await contract.getElections();
    const newElectionsMap = new Map();

    if (allElections.length === 0) {
      return [];
    }
    const ceramicElections = allElections.filter(d => {
      return d.startsWith(CERAMIC_PREFIX);
    });
    const firebaseElectionIds = allElections.filter(d => {
      return !d.startsWith(CERAMIC_PREFIX);
    });

    if (firebaseElectionIds.length > 0) {
      const firebaseElections = await axios.get(serverUrl + `distributions/ids/${firebaseElectionIds.join(",")}`, {
        firebaseElectionIds,
      });

      console.log({ firebaseElections });
      const firebaseFormattedElections = await Promise.all(
        firebaseElections.data.map(async firebaseElec => {
          const votedResult = await axios.get(serverUrl + `distribution/state/${firebaseElec.id}/${address}`);
          const { hasVoted } = votedResult.data;
          const nVoted = Object.keys(firebaseElec.data.votes).length;
          const tags = [];
          if (firebaseElec.data.creator === address) {
            tags.push("admin");
          }
          if (firebaseElec.data.candidates.includes(address)) {
            tags.push("candidate");
          }
          if (hasVoted) {
            tags.push("voted");
          }
          const formattedElection = {
            id: firebaseElec.id,
            name: firebaseElec.data.name,
            description: firebaseElec.data.description,
            created_date: new Date(firebaseElec.createdAt).toLocaleDateString(),
            creator: firebaseElec.data.creator,
            status: firebaseElec.data.active,
            paid: firebaseElec.data.paid,
            n_voted: { n_voted: nVoted, outOf: firebaseElec.data.candidates.length },
            tags,
          };
          return { id: firebaseElec.id, ...formattedElection };
        }),
      );
      console.log({ firebaseFormattedElections });
      firebaseFormattedElections.forEach(({ id, ...election }) => {
        newElectionsMap.set(id, election);
      });
    } else {
      for (let i = 0; i < ceramicElections.length; i++) {
        const serializedElection = await serializeCeramicElection(ceramicElections[i], address);
        newElectionsMap.set(ceramicElections[i], serializedElection);
      }
    }
    return newElectionsMap;
  };

  return {
    getElections,
  };
}
