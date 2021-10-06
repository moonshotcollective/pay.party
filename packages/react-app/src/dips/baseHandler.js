import axios from "axios";
import { makeCeramicClient } from "../helpers";
import qs from "query-string";
export default function BaseHandler(tx, readContracts, writeContracts, mainnetProvider, address, userSigner) {
  const getElections = async () => {
    const contract = readContracts.Diplomat;
    const allElections = await contract.getElections();

    if (allElections.length == 0) {
      return [];
    }

    const ceramicElections = allElections.filter(d => {
      return d.startsWith("ceramic://");
    });

    const firebaseElectionIds = allElections.filter(d => {
      return !d.startsWith("ceramic://");
    });

    const serverUrl = process.env.REACT_APP_API_URL || "http://localhost:45622/";

    console.log({ firebaseElectionIds });
    const firebaseElections = await axios.get(serverUrl + `distributions/ids/${firebaseElectionIds.join(",")}`, {
      firebaseElectionIds,
    });

    console.log({ firebaseElections });
    const newElectionsMap = new Map();
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

    const { idx, ceramic } = await makeCeramicClient();

    for (let i = 0; i < ceramicElections.length; i++) {
      const electionDoc = await ceramic.loadStream(ceramicElections[i]);
      const creatorDid = electionDoc.controllers[0];

      let creatorMainAddress = creatorDid;
      const creatorAccounts = await idx.get("cryptoAccounts", creatorDid);
      const tags = [];

      if (creatorAccounts) {
        console.log({ creatorAccounts });
        const accounts = Object.keys(creatorAccounts);
        const [mainAddress, networkAndChainId] = Object.keys(creatorAccounts)[0].split("@");
        creatorMainAddress = mainAddress;
        if (
          Object.keys(creatorAccounts).some(creatorAddress =>
            electionDoc.content.candidates.includes(creatorAddress.split("@")[0]),
          )
        ) {
          tags.push("candidate");
        }
        if (Object.keys(creatorAccounts).some(creatorAddress => address === creatorAddress.split("@")[0])) {
          tags.push("admin");
        }
      }
      const formattedElection = {
        name: electionDoc.content.name,
        description: electionDoc.content.description,
        created_date: new Date(electionDoc.content.createdAt).toLocaleDateString(),
        creatorDid,
        creator: creatorMainAddress || creatorDid,
        status: electionDoc.content.isActive,
        paid: electionDoc.content.isPaid,
        n_voted: { n_voted: 888, outOf: electionDoc.content.candidates.length },
        tags,
      };
      newElectionsMap.set(`ceramic://${ceramicElections[i]}`, formattedElection);
    }
    return newElectionsMap;
  };

  return {
    getElections,
  };
}
