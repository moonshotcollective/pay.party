import React, { useState, useEffect, useRef } from "react";
import { fromWei, toWei, toBN, numberToHex } from "web3-utils";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import axios from "axios";
import Diplomat from "../contracts/hardhat_contracts.json";
import { serverUrl } from "./baseHandler";
import { getNetwork } from "./helpers";

export default function OffChain(tx, readContracts, writeContracts, mainnetProvider, address, userSigner) {
  const createElection = async ({ name, candidates, fundAmount, tokenAdr, votes, kind }) => {
    const { network, provider, signer } = await getNetwork();
    const message = "qdip-create-" + address;
    const signature = await provider.send("personal_sign", [message, address]);
    const result = await axios.post(serverUrl + "distributions", {
      name,
      creator: address,
      candidates,
      fundAmount,
      tokenAdr,
      votes,
      kind,
      address,
      signature,
    });

    const electionId = result.data.electionId;

    let contract = new ethers.Contract(
      Diplomat[network.chainId][network.name].contracts.Diplomat.address,
      Diplomat[network.chainId][network.name].contracts.Diplomat.abi,
      signer,
    );

    let transaction = await contract.createElection(electionId);
    const receipt = await transaction.wait();
    const id = receipt.events[0].args.electionId;

    return electionId; //result.data.success;
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
    const numElections = await contract.electionCount();
    console.log({ numElections });
    const newElectionsMap = new Map();
    for (let i = 0; i < numElections; i++) {
      const election = await contract.getElection(i);

      const votedResult = await axios.get(serverUrl + `distribution/${id}/${address}`);
      const { hasVoted } = votedResult.data;

      const offChainElectionResult = await axios.get(serverUrl + `distribution/${id}`);
      const { election: offChainElection } = offChainElectionResult.data;
      console.log({ offChainElection });
      const nVoted = Object.keys(offChainElection.votes).length;

      const tags = [];
      if (election.creator === address) {
        tags.push("admin");
      }
      if (election.candidates.includes(address)) {
        tags.push("candidate");
      }
      if (hasVoted) {
        tags.push("voted");
      }
      let status = election.active;
      let created = new Date(election.date * 1000).toISOString().substring(0, 10);
      let electionEntry = {
        id: i,
        created_date: created,
        name: election.name,
        creator: election.creator,
        n_voted: { n_voted: nVoted, outOf: election.candidates.length },
        status: status,
        tags: tags,
      };
      newElectionsMap.set(i, electionEntry);
    }
    console.log({ newElectionsMap });
    return newElectionsMap;
  };

  const getElectionStateById = async id => {
    // TODO: make get request to backend and return election formatted
    let fb = await axios.get(serverUrl + `distributions/${id}`); //await readContracts.Diplomat.getElection(id);

    const addressElectionState = await axios.get(serverUrl + `distribution/state/${id}/${address}`);
    const hasVoted = addressElectionState.data.hasVoted;
    const nVoted = addressElectionState.data.nVoted;
    const isAdmin = address === fb.data.creator;
    const isCandidate = fb.data.candidates.includes(address);

    const tags = [];
    if (hasVoted) {
      tags.push("voted");
    }
    if (isAdmin) {
      tags.push("admin");
    }
    if (isCandidate) {
      tags.push("candidate");
    }

    const formattedElection = {
      ...fb.data,
      id: id,
      created_date: new Date().toLocaleDateString(), // TODO: Update date
      n_voted: { n_voted: nVoted, outOf: fb.data.candidates.length },
      isCandidate: isCandidate,
      isAdmin: isAdmin,
      isPaid: fb.data.paid,
      canVote: !hasVoted && isCandidate,
      tags: tags,
    };

    console.log({ formattedElection });
    return formattedElection;
  };

  const getCandidatesScores = async id => {
    console.log("HERE!");
    // TODO: get candidate scores from backend
    // let onChainElection = await readContracts.Diplomat.getElection(id);
    const offChainElectionResult = await axios.get(serverUrl + `distributions/${id}`);
    console.log(offChainElectionResult);
    const election = offChainElectionResult.data;
    console.log({ election });

    let totalScores = [];
    if (Object.values(election.votes).length > 0) {
      for (const candidateVotes of Object.values(election.votes)) {
        candidateVotes.forEach((voteScore, i) => {
          if (totalScores[i] !== 0 && !totalScores[i]) {
            return totalScores.push(voteScore);
          }
          totalScores[i] = totalScores[i] + voteScore;
        });
      }
    }

    // return totalScores;
    // let fb = await axios.get(serverUrl + `distributions/${id}`); //await readContracts.Diplomat.getElection(id);
    // console.log({ fb });
    // const scores = Object.values(fb);
    console.log({ totalScores });
    return totalScores;
  };

  const getFinalPayout = async id => {
    // const election = await readContracts.Diplomat.getElection(id);
    let election = await axios.get(serverUrl + `distributions/${id}`); //await readContracts.Diplomat.getElection(id);
    console.log({ election });
    const electionFunding = election.data.fundAmount;
    // const offChainElectionResult = await axios.get(serverUrl + `distribution/${id}`);
    // const { election: offChainElection } = offChainElectionResult.data;

    let totalScores = await getCandidatesScores(id);
    let payout = [];
    let totalScoresSum = totalScores.reduce((sum, curr) => sum + curr, 0);
    console.log({ totalScoresSum });
    let scores = [];

    for (let i = 0; i < election.data.candidates.length; i++) {
      const candidateScore = election.data.votes[election.data.candidates[i]];
      console.log({ candidateScore });
      let scoreSum = 0;
      if (!candidateScore) {
        scores.push(candidateScore);
        scoreSum += candidateScore;
      } else {
        scores.push(0);
      }
    }

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

  const distributeEth = async ({ id, candidates, payoutInWei, totalValueInWei, tokenAddress }) => {
    console.log("Distributing..." + totalValueInWei);
    const { provider, signer, network } = await getNetwork();
    const contract = new ethers.Contract(
      Diplomat[network.chainId][network.name].contracts.Diplomat.address,
      Diplomat[network.chainId][network.name].contracts.Diplomat.abi,
      signer,
    );

    const transaction = await contract.payElection(id, candidates, payoutInWei, tokenAddress, {
      value: totalValueInWei,
    });
    const receipt = await transaction.wait();

    return axios
      .post(serverUrl + "distributions/" + id + "/pay", {
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
        console.log("Error on 'distrubuteEth' distributions post");
        throw e;
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
