import { Caip10Link } from "@ceramicnetwork/stream-caip10-link";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

import { makeCeramicClient } from "../helpers";

export const CERAMIC_PREFIX = "ceramic://";

const CURRENCY = "ETH";
const TOKEN = process.env.REACT_APP_TOKEN_SYMBOL;
const TOKEN_ADR = process.env.REACT_APP_TOKEN_ADDRESS;

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
  console.log(network);
  if (network.chainId === 31337 || network.chainId === 1337) {
    network = { name: "localhost", chainId: 31337 };
  }
  if (network.name === "homestead") {
    network = { name: "mainnet", chainId: 1 };
  }
  return { network, signer, provider };
};

export const toCeramicId = id => (id.startsWith(CERAMIC_PREFIX) ? id : CERAMIC_PREFIX + id);

export const serializeCeramicElection = async (ceramicElectionId, address, ceramic, idx) => {
  console.log("serializeCeramicElection");
  const id = toCeramicId(ceramicElectionId);
  if (!idx || !ceramic) {
    // console.log("making ceramic client");
    const { idx: idx1, ceramic: ceramic1 } = await makeCeramicClient();
    ceramic = ceramic1;
    idx = idx1;
  }
  //   const { idx, ceramic } = await makeCeramicClient();

  const electionDoc = await ceramic.loadStream(id);
  const creatorDid = electionDoc.controllers[0];
  let creatorMainAddress = creatorDid;
  const creatorAccounts = await idx.get("cryptoAccounts", creatorDid);
  const tags = [];
  const { network } = await getNetwork();
  const caip10 = await Caip10Link.fromAccount(ceramic, `${address}@eip155:${network.chainId}`);
  const existingVotes = await idx.get("votes", caip10.did);
  // TODO: check if already voted for this election through another address
  const previousVotes = existingVotes ? Object.values(existingVotes) : null;
  //   console.log({ existingVotes });
  const hasVoted = previousVotes && previousVotes.find(vote => toCeramicId(vote.electionId) === id);
  if (creatorAccounts) {
    const accounts = Object.keys(creatorAccounts);
    const [mainAddress, networkAndChainId] = Object.keys(creatorAccounts)[0].split("@");
    creatorMainAddress = mainAddress;
    if (hasVoted) {
      tags.push("voted");
    }
    if (Object.keys(creatorAccounts).some(creatorAddress => address === creatorAddress.split("@")[0])) {
      tags.push("admin");
    }
    if (electionDoc.content.candidates.includes(address)) {
      tags.push("candidate");
    }
  }

  const candidateDids = await Promise.all(
    electionDoc.content.candidates.map(async candidateAddress => {
      const caip10 = await Caip10Link.fromAccount(ceramic, `${candidateAddress}@eip155:${network.chainId}`);
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
        // console.log(sealedVoteDoc.content);
        candidatesSealedBallots[electionDoc.content.candidates[i]] = sealedVoteDoc.content.map(
          vote => vote.voteAttribution,
        );
      }
    }
  }

  const nVoted = Object.keys(candidatesSealedBallots) ? Object.keys(candidatesSealedBallots).length : 0;

  //  TODO: payout & total scores
  const defaultValues = electionDoc.content.candidates.reduce((candidatesAddress, addr) => {
    candidatesAddress[addr] = 0;
    return candidatesAddress;
  }, {});

  const ballots = Object.values(candidatesSealedBallots);
  //   console.log(ballots);
  let totalScores = [];
  if (ballots.length > 0) {
    for (const candidateVotes of ballots) {
      console.log({ candidateVotes });
      candidateVotes.forEach((voteScore, i) => {
        // console.log(voteScore);
        if (totalScores[i] !== 0 && !totalScores[i]) {
          return totalScores.push(voteScore);
        }
        totalScores[i] = totalScores[i] + voteScore;
      });
    }
  }
  let tokenSymbol = "ETH";
  if (electionDoc.content.tokenAddress == TOKEN_ADR) {
    tokenSymbol = TOKEN;
  }
  //   console.log({ content: electionDoc.content });
  const serializedElection = {
    id,
    name: electionDoc.content.name,
    candidates: electionDoc.content.candidates,
    canVote: electionDoc.content.isActive && !hasVoted && tags.includes("candidate"),
    description: electionDoc.content.description,
    hasVoted,
    created_date: new Date(electionDoc.content.createdAt).toLocaleDateString(),
    creatorDid,
    fundAmount: electionDoc.content.fundAmount,
    fundAmountInWei: electionDoc.content.fundAmountInWei,
    tokenAdr: electionDoc.content.tokenAddress,
    tokenSymbol: tokenSymbol,
    creator: creatorMainAddress || creatorDid,
    status: electionDoc.content.isActive,
    isPaid: electionDoc.content.isPaid,
    voteAllocation: electionDoc.content.voteAllocation,
    n_voted: { n_voted: nVoted, outOf: electionDoc.content.candidates.length },
    votes: candidatesSealedBallots,
    totalScores,
    tags: tags,
    isCandidate: tags.includes("candidate"),
    isAdmin: tags.includes("admin"),
    active: electionDoc.content.isActive,
  };
  return serializedElection;
};
