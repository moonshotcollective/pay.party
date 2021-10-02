import React, { useState, useEffect, useRef } from "react";
import { fromWei, toWei, toBN, numberToHex } from "web3-utils";
const axios = require("axios");

export const serverUrl = "http://localhost:45622/";

export default function OffChain(tx, readContracts, writeContracts, mainnetProvider, address, userSigner) {
  const createElection = async ({ name, candidates, fundAmount, tokenAdr, votes, kind }) => {
    console.log(`Saving election data off-chain`);

    // const result = await
    return new Promise((resolve, reject) => {
      tx(writeContracts.Diplomat.createElection(name, candidates, fundAmount, tokenAdr, votes, kind), async update => {
        console.log("📡 Transaction Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          console.log({ update });
          const receipt = await update.wait();
          console.log(address);
          const onChainElectionId = receipt.events[0].args.electionId.toNumber();
          const message = "qdip-create-" + address;
          const signature = await userSigner.provider.send("personal_sign", [message, address]);
          console.log("new election created", onChainElectionId);
          return axios
            .post(serverUrl + "distributions", {
              onChainElectionId,
              name,
              candidates,
              fundAmount,
              tokenAdr,
              votes,
              kind,
              address,
              signature,
            })
            .then(res => {
              console.log(res.data, res.data.success);
              resolve(res.data.success);
            })
            .catch(reject);
        } else {
          reject(update);
        }
      });
    });
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
      const nVoted = Object.keys(offChainElection.votes).length + 1;

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
        if (!totalScores[i]) {
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

    let scores = [];
    let payout = [];
    let scoreSum = 0;
    for (let i = 0; i < election.candidates.length; i++) {
      const candidateScore = offChainElection.votes[election.candidates[i]];
      console.log({ candidateScore });
      if (!candidateScore) {
        scores.push(candidateScore);
        scoreSum += candidateScore;
      } else {
        scores.push(0);
      }
    }

    for (let i = 0; i < scores.length; i++) {
      const candidatePay = Math.floor((scores[i] / scoreSum) * electionFunding);
      if (!isNaN(candidatePay)) {
        payout.push(fromWei(candidatePay.toString()));
      } else {
        payout.push(0);
      }
    }
    return {
      scores: scores,
      payout: payout,
      scoreSum: scoreSum,
    };
  };

  const distributeEth = async (id, adrs, weiDist, totalValueInWei) => {};

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
