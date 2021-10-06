import React, { useState, useEffect, useRef } from "react";
import { fromWei, toWei, toBN, numberToHex } from "web3-utils";
import { Caip10Link } from "@ceramicnetwork/stream-caip10-link";

import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import axios from "axios";
import Diplomat from "../contracts/hardhat_contracts.json";
import { makeCeramicClient } from "../helpers";
import { getCeramicElectionIds, serializeCeramicElection } from "./helpers";

export const serverUrl = process.env.REACT_APP_API_URL || "http://localhost:45622/";

export default function CeramicHandler(tx, readContracts, writeContracts, mainnetProvider, address, userSigner) {
  const createElection = async ({ name, description, candidates, votes }) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    let network = await provider.getNetwork();
    if (network.chainId === 31337 || network.chainId === 1337) {
      network = { name: "localhost", chainId: 31337 };
    }
    /* CREATE CERAMIC ELECTION */
    const { ceramic, idx, schemasCommitId } = await makeCeramicClient(address);
    // current users' existing elections
    const existingElections = await idx.get("elections");
    const previousElections = existingElections ? Object.values(existingElections) : null;

    // make sure the user is Authenticated
    if (ceramic?.did?.id) {
      // create the election document on Ceramic
      const electionDoc = await TileDocument.create(
        ceramic,
        {
          name,
          description,
          candidates,
          voteAllocation: votes,
          createdAt: new Date().toISOString(),
          isActive: true,
          isPaid: false,
        },
        {
          // owner of the document
          controllers: [ceramic.did.id],
          family: "election",
          // schemaId to be used to validate the submitted data
          schema: schemasCommitId.election,
        },
      );
      // https://developers.ceramic.network/learn/glossary/#anchor-commit
      // https://developers.ceramic.network/learn/glossary/#anchor-service
      const anchorStatus = await electionDoc.requestAnchor();
      await electionDoc.makeReadOnly();
      Object.freeze(electionDoc);

      const electionId = electionDoc.commitId.toUrl();

      /* CREATE ELECTION ON-CHAIN (push the ceramic commitId to elections array) */
      let contract = new ethers.Contract(
        Diplomat[network.chainId][network.name].contracts.Diplomat.address,
        Diplomat[network.chainId][network.name].contracts.Diplomat.abi,
        signer,
      );
      let transaction = await contract.createElection(electionId);
      const receipt = await transaction.wait();
      const id = receipt.events[0].args.electionId;
      return id;
    }
  };

  const endElection = async id => {
    console.log(`Ending election`, id);
    const message = "qdip-finish-" + id + address;
    console.log("Message:" + message);
    let signature = await userSigner.provider.send("personal_sign", [message, address]);
    // console.log(signature);
    return axios
      .post(serverUrl + "distributions/" + id + "/finish", {
        address: address,
      })
      .then(response => {
        // console.log(response);
        if (response.status == 200) {
          return response.statusText;
        } else {
          throw response;
        }
      })
      .catch(e => {
        console.log("Error on 'endElection' distributions post");
        throw e;
      });
  };

  const castBallot = async (id, candidates, quad_scores) => {
    const { idx, ceramic, schemasCommitId } = await makeCeramicClient(address);

    const existingVotes = await idx.get("votes");
    // TODO: check if already voted for this election through another address
    console.log({ existingVotes });
    const previousVotes = existingVotes ? Object.values(existingVotes) : null;
    const hasAlreadyVotedForElec = previousVotes && previousVotes.find(vote => vote.name === election.name);
    if (hasAlreadyVotedForElec) {
      console.error("Already voted for this election");
      return;
    }

    const voteAttribution = votes.map((voteAttributionCount, i) => ({
      address: election.candidates[i],
      voteAttribution: voteAttributionCount,
    }));

    if (ceramic?.did?.id) {
      const ballotDoc = await TileDocument.create(ceramic, voteAttribution, {
        controllers: [ceramic.did.id],
        family: "vote",
        schema: schemasCommitId.vote,
      });
      // https://developers.ceramic.network/learn/glossary/#anchor-commit
      // https://developers.ceramic.network/learn/glossary/#anchor-service
      const anchorStatus = await ballotDoc.requestAnchor();
      await ballotDoc.makeReadOnly();
      Object.freeze(ballotDoc);

      const previousVotes = (await idx.get("votes", ceramic.did.id)) || {};
      await idx.set("votes", [{ id: ballotDoc.id.toUrl(), electionId: id }, ...Object.values(previousVotes)]);

      const sealedBallot = ballotDoc.commitId.toUrl();
      console.log({ anchorStatus, ballotDoc: ballotDoc });
    }
  };

  const getElections = async () => {
    const contract = readContracts.Diplomat;
    const elections = await getCeramicElectionIds(contract);
    const newElectionsMap = new Map();
    const { idx, ceramic } = await makeCeramicClient();

    for (let i = 0; i < elections.length; i++) {
      const election = await serializeCeramicElection(elections[i], address);
      newElectionsMap.set(elections[i], election);
    }
    return newElectionsMap;
  };

  const getElectionStateById = async id => {
    const { idx, ceramic } = await makeCeramicClient(address);
    const election = await serializeCeramicElection(id, address);
    const caip10 = await Caip10Link.fromAccount(ceramic, `${address}@eip155:1`);
    const existingVotes = await idx.get("votes", caip10.did);
    // TODO: check if already voted for this election through another address
    const previousVotes = existingVotes ? Object.values(existingVotes) : null;
    const hasAlreadyVotedForElec = previousVotes && previousVotes.find(vote => vote.electionId === id);
    if (hasAlreadyVotedForElec) {
      console.error("Already voted for this election");
      return;
    }
    election.isCandidate = election.tags.includes("candidate");
    election.isAdmin = election.tags.includes("admin");
    election.canVote = !hasAlreadyVotedForElec && election.isCandidate;
    election.active = election.status;
    return election;
  };

  const getCandidatesScores = async id => {
    const { idx, ceramic } = await makeCeramicClient(address);
    const election = await serializeCeramicElection(id, address);
    const candidateDids = await Promise.all(
      election.candidates.map(async candidateAddress => {
        const caip10 = await Caip10Link.fromAccount(ceramic, `${address}@eip155:1`);
        return caip10.did;
      }),
    );
    const candidatesSealedBallots = [];
    for (const candidateDid of candidateDids) {
      const candidateVotes = await idx.get("votes", candidateDid);
      const foundElectionBallots = Object.values(candidateVotes).find(vote => vote.name === election.name);
      console.log({ foundElectionBallots });
      // load the stream
      const candidateBallotDoc = await TileDocument.load(ceramic, foundElectionBallots.id);
      // get the first commitId which immutable
      const { allCommitIds } = candidateBallotDoc;

      const sealedVote = allCommitIds[0];
      // load the first commit
      const sealedVoteDoc = await TileDocument.load(ceramic, sealedVote);
      console.log("sealed", sealedVoteDoc.content);
      candidatesSealedBallots.push(...sealedVoteDoc.content);
    }
    const defaultValues = election.candidates.reduce((candidatesAddress, addr) => {
      candidatesAddress[addr] = "0";
      return candidatesAddress;
    }, {});
    const totalScoresPerCandidates = candidatesSealedBallots.reduce((candidateScores, ballot) => {
      console.log(ballot);
      console.log(ballot.voteAttribution);
      candidateScores[ballot.address] = candidateScores[ballot.address]
        ? (parseFloat(candidateScores[ballot.address]) + parseFloat(ballot.voteAttribution)).toString()
        : "0";
      return candidateScores;
    }, defaultValues);
    return Object.values(totalScoresPerCandidates);
  };

  const getFinalPayout = async id => {
    return {
      scores: [],
      payout: [],
      scoreSum: 0,
    };
    // const election = await readContracts.Diplomat.getElection(id);
    // const electionFunding = election.amount;
    // const offChainElectionResult = await axios.get(serverUrl + `distribution/${id}`);
    // const { election: offChainElection } = offChainElectionResult.data;

    // let totalScores = await getCandidatesScores(id);
    // let payout = [];
    // let totalScoresSum = totalScores.reduce((sum, curr) => sum + curr, 0);
    // console.log({ totalScoresSum });

    // // for (let i = 0; i < election.candidates.length; i++) {
    // //   const candidateScore = offChainElection.votes[election.candidates[i]];
    // //   console.log({ candidateScore });
    // //   if (!candidateScore) {
    // //     scores.push(candidateScore);
    // //     scoreSum += candidateScore;
    // //   } else {
    // //     scores.push(0);
    // //   }
    // // }

    // for (let i = 0; i < totalScores.length; i++) {
    //   const candidatePay = Math.floor((totalScores[i] / totalScoresSum) * electionFunding);
    //   if (!isNaN(candidatePay)) {
    //     payout.push(fromWei(candidatePay.toString()));
    //   } else {
    //     payout.push(0);
    //   }
    // }
    // return {
    //   scores: totalScores,
    //   payout: payout,
    //   scoreSum: totalScoresSum,
    // };
  };

  const distributeEth = async (id, adrs, weiDist, totalValueInWei) => {
    console.log("Distributing...");
    return new Promise((resolve, reject) => {
      tx(
        writeContracts.Diplomat.payElection(id, adrs, weiDist, {
          value: totalValueInWei,
        }),
        update => {
          console.log("📡 Transaction Update:", update);
          if (update) {
            if (update.status === "confirmed" || update.status === 1) {
              resolve(update);
            } else if (!update.status) {
              reject(update);
            }
          } else {
            reject(update);
          }
        },
      );
    });
  };

  const sendBackendOnCreate = async (newElection, address) => {};

  return {
    createElection,
    endElection,
    getElections,
    getElectionStateById,
    castBallot,
    getCandidatesScores,
    getFinalPayout,
    distributeEth,
    sendBackendOnCreate,
  };
}
