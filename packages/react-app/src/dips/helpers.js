import { makeCeramicClient } from "../helpers";
export const CERAMIC_PREFIX = "ceramic://";
export const getCeramicElectionIds = async diplomatContract => {
  const allElections = await diplomatContract.getElections();
  if (!allElections) {
    return [];
  }
  const elections = allElections.filter(d => {
    return d.startsWith(CERAMIC_PREFIX);
  });
  if (!elections || elections.length === 0) {
    return [];
  }
  return elections;
};

export const serializeCeramicElection = async (ceramicElectionId, address) => {
  const { idx, ceramic } = await makeCeramicClient();
  const electionDoc = await ceramic.loadStream(ceramicElectionId);
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
  const serializedElection = {
    id: ceramicElectionId,
    name: electionDoc.content.name,
    candidates: electionDoc.content.candidates,
    description: electionDoc.content.description,
    created_date: new Date(electionDoc.content.createdAt).toLocaleDateString(),
    creatorDid,
    creator: creatorMainAddress || creatorDid,
    status: electionDoc.content.isActive,
    paid: electionDoc.content.isPaid,
    n_voted: { n_voted: 888, outOf: electionDoc.content.candidates.length },
    tags,
  };
  return serializedElection;
};
