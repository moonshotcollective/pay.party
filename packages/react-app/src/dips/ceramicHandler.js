import React, { useState, useEffect, useRef } from "react";
import { fromWei, toWei, toBN, numberToHex } from "web3-utils";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import axios from "axios";
import Diplomat from "../contracts/hardhat_contracts.json";
import { makeCeramicClient } from "../helpers";

export const serverUrl = process.env.REACT_APP_API_URL || "http://localhost:45622/";

export default function CeramicHandler(tx, readContracts, writeContracts, mainnetProvider, address, userSigner) {
  const createElection = async ({ name, description, candidates, votes }) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const network = await provider.getNetwork();
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

      const electionId = electionDoc.commitId.toString();

      /* CREATE ELECTION ON-CHAIN (push the ceramic commitId to elections array) */
      let contract = new ethers.Contract(
        Diplomat[network.chainId][network.name].contracts.Diplomat.address,
        Diplomat[network.chainId][network.name].contracts.Diplomat.abi,
        signer,
      );
      let transaction = await contract.createElection(electionId);
      const receipt = await transaction.wait();
      const onChainElectionId = receipt.events[0].args.electionId;
      return onChainElectionId;
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
    console.log(`casting ballot in offChain()`);
    console.log(id);
    const message = "qdip-vote-" + id + address;
    console.log("Message:" + message);
    let signature = await userSigner.provider.send("personal_sign", [message, address]);
    console.log(signature);
    return axios
      .post(serverUrl + "distributions/" + id + "/vote", {
        address: address,
        candidates: candidates,
        scores: quad_scores,
        signature: signature,
      })
      .then(async response => {
        if (response.data && response.data.success) {
          const totalScores = await getCandidatesScores(id);
          return totalScores;
        }
      })
      .catch(e => {
        console.log("Error on distributions post", e);
      });
  };

  const getElections = async () => {
    const contract = readContracts.Diplomat;
    const elections = await contract.getElections();
    console.log({ elections });
    const newElectionsMap = new Map();
    const { idx, ceramic } = await makeCeramicClient();

    for (let i = 0; i < elections.length; i++) {
      const electionDoc = await ceramic.loadStream(elections[i]);
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
      newElectionsMap.set(elections[i], formattedElection);
    }
    return newElectionsMap;
  };

  const getElectionStateById = async id => {
    let election = {};
    let loadedElection = await readContracts.Diplomat.getElection(id);
    election = { ...loadedElection };
    election.isPaid = loadedElection.paid;
    election.fundingAmount = fromWei(loadedElection.amount.toString(), "ether");
    election.isCandidate = loadedElection.candidates.includes(address);
    election.isAdmin = loadedElection.creator === address;

    const votedResult = await axios.get(serverUrl + `distribution/state/${id}/${address}`);
    const { hasVoted, isActive } = votedResult.data;
    election.canVote = !hasVoted && election.isCandidate;
    console.log({ isActive });
    election.active = isActive;
    return election;
  };

  const getCandidatesScores = async id => {
    let onChainElection = await readContracts.Diplomat.getElection(id);
    const offChainElectionResult = await axios.get(serverUrl + `distribution/${id}`);
    const { election: offChainElection } = offChainElectionResult.data;
    let totalScores = [];
    for (const candidateVotes of Object.values(offChainElection.votes)) {
      candidateVotes.forEach((voteScore, i) => {
        if (totalScores[i] !== 0 && !totalScores[i]) {
          return totalScores.push(voteScore);
        }
        totalScores[i] = totalScores[i] + voteScore;
      });
    }

    return totalScores;
  };

  const getFinalPayout = async id => {
    const election = await readContracts.Diplomat.getElection(id);
    const electionFunding = election.amount;
    const offChainElectionResult = await axios.get(serverUrl + `distribution/${id}`);
    const { election: offChainElection } = offChainElectionResult.data;

    let totalScores = await getCandidatesScores(id);
    let payout = [];
    let totalScoresSum = totalScores.reduce((sum, curr) => sum + curr, 0);
    console.log({ totalScoresSum });

    // for (let i = 0; i < election.candidates.length; i++) {
    //   const candidateScore = offChainElection.votes[election.candidates[i]];
    //   console.log({ candidateScore });
    //   if (!candidateScore) {
    //     scores.push(candidateScore);
    //     scoreSum += candidateScore;
    //   } else {
    //     scores.push(0);
    //   }
    // }

    for (let i = 0; i < totalScores.length; i++) {
      const candidatePay = Math.floor((totalScores[i] / totalScoresSum) * electionFunding);
      if (!isNaN(candidatePay)) {
        payout.push(fromWei(candidatePay.toString()));
      } else {
        payout.push(0);
      }
    }
    return {
      scores: totalScores,
      payout: payout,
      scoreSum: totalScoresSum,
    };
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
