import { Caip10Link } from "@ceramicnetwork/stream-caip10-link";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

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

export const getNetwork = async () => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  let network = await provider.getNetwork();
  if (network.chainId === 31337 || network.chainId === 1337) {
    network = { name: "localhost", chainId: 31337 };
  }
  return network;
};

export const toCeramicId = id => (id.startsWith(CERAMIC_PREFIX) ? id : CERAMIC_PREFIX + id);

export const serializeCeramicElection = async (ceramicElectionId, address) => {
  const id = toCeramicId(ceramicElectionId);
  const { idx, ceramic } = await makeCeramicClient();
  const electionDoc = await ceramic.loadStream(id);
  const creatorDid = electionDoc.controllers[0];

  let creatorMainAddress = creatorDid;
  const creatorAccounts = await idx.get("cryptoAccounts", creatorDid);
  const tags = [];

  if (creatorAccounts) {
    const accounts = Object.keys(creatorAccounts);
    const [mainAddress, networkAndChainId] = Object.keys(creatorAccounts)[0].split("@");
    creatorMainAddress = mainAddress;
    if (Object.keys(creatorAccounts).some(creatorAddress => address === creatorAddress.split("@")[0])) {
      tags.push("admin");
    }
    if (
      Object.keys(creatorAccounts).some(creatorAddress =>
        electionDoc.content.candidates.includes(creatorAddress.split("@")[0]),
      )
    ) {
      tags.push("candidate");
    }
  }

  const network = await getNetwork();
  const candidateDids = await Promise.all(
    electionDoc.content.candidates.map(async candidateAddress => {
      const caip10 = await Caip10Link.fromAccount(ceramic, `${address}@eip155:${network.chainId}`);
      return caip10.did;
    }),
  );
  const candidatesSealedBallots = {};
  for (let i = 0; i < candidateDids.length; i++) {
    const candidateDid = candidateDids[i];
    const candidateVotes = await idx.get("votes", candidateDid);
    if (candidateVotes) {
      const foundElectionBallots = Object.values(candidateVotes).find(vote => {
        return toCeramicId(vote.electionId) === id;
      });
      if (foundElectionBallots) {
        // load the stream
        const candidateBallotDoc = await TileDocument.load(ceramic, foundElectionBallots.id);
        // get the first commitId which immutable
        const { allCommitIds } = candidateBallotDoc;

        const sealedVote = allCommitIds[0];
        // load the first commit
        const sealedVoteDoc = await TileDocument.load(ceramic, sealedVote);
        if (electionDoc.content.candidates[i] === address) {
          candidatesSealedBallots[electionDoc.content.candidates[i]] = candidateBallotDoc.content.map(
            vote => vote.voteAttribution,
          );
        }
      }
    }
  }

  const nVoted = Object.keys(candidatesSealedBallots).length;

  // TODO: payout & total scores
  const defaultValues = electionDoc.content.candidates.reduce((candidatesAddress, addr) => {
    candidatesAddress[addr] = 0;
    return candidatesAddress;
  }, {});
  if (candidatesSealedBallots.length > 0) {
    const totalScoresPerCandidates = candidatesSealedBallots.reduce((candidateScores, ballot) => {
      candidateScores[ballot.address] = candidateScores[ballot.address]
        ? parseFloat(candidateScores[ballot.address]) + parseFloat(ballot.voteAttribution)
        : 0;
      return candidateScores;
    }, defaultValues);
    return Object.values(totalScoresPerCandidates);
  }

  const serializedElection = {
    id,
    name: electionDoc.content.name,
    candidates: electionDoc.content.candidates,
    description: electionDoc.content.description,
    created_date: new Date(electionDoc.content.createdAt).toLocaleDateString(),
    creatorDid,
    creator: creatorMainAddress || creatorDid,
    status: electionDoc.content.isActive,
    paid: electionDoc.content.isPaid,
    voteAllocation: electionDoc.content.voteAllocation,
    n_voted: { n_voted: nVoted, outOf: serializedElection.n_voted.outOf },
    votes: candidatesSealedBallots,
    tags,
  };
};
