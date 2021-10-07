import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { fromWei, toWei, toBN, numberToHex } from "web3-utils";
import { serverUrl } from "./baseHandler";

export default function OnChain(tx, readContracts, writeContracts, mainnetProvider, address, userSigner) {
  const createElection = async data => {
    console.log(`Saving election data`, data);
    return new Promise((resolve, reject) => {
      tx(
        writeContracts.Diplomat.createElection(
          data.name,
          data.candidates,
          data.fundAmount,
          data.tokenAdr,
          data.votes,
          data.kind,
        ),
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

  const endElection = async id => {
    console.log(`Ending election`, id);
    return new Promise((resolve, reject) => {
      tx(writeContracts.Diplomat.endElection(id), update => {
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
      });
    });
  };

  const castBallot = async (id, candidates, quad_scores) => {
    // console.log(`casting ballot`);
    return new Promise((resolve, reject) => {
      tx(writeContracts.Diplomat.vote(id, candidates, quad_scores), update => {
        console.log("📡 Transaction Update:", update);
        if (update) {
          if (update.status === "confirmed" || update.status === 1) {
            return getCandidatesScores(id).then(resolve).catch(reject);
          } else if (!update.status) {
            reject(update);
          }
        } else {
          reject(update);
        }
      });
    });
  };

  const getElections = async () => {
    const contract = readContracts.Diplomat;
    const numElections = await contract.electionCount();
    console.log({ numElections });
    const newElectionsMap = new Map();

    for (let i = 0; i < numElections; i++) {
      const election = await contract.getElection(i);
      console.log({ election });
      let electionEntry = {
        n_voted: { outOf: election.candidates.length },
      };
      let hasVoted = false;
      let isActive = false;
      if (election.kind === "onChain") {
        hasVoted = await contract.getAddressVoted(i, address);
        isActive = election.active;
        console.log({ hasVoted });
        const electionVoted = await contract.getElectionNumVoted(i);
        electionEntry.n_voted = {
          ...electionEntry.n_voted,
          n_voted: electionVoted.toNumber(),
        };
      }
      if (election.kind === "offChain") {
        const offChainElections = await axios.get(serverUrl + "distributions");
        console.log({ offChainElections });
        const electionExists = offChainElections.data.some(offChainElec => offChainElec.data.id === i);
        if (!electionExists) {
          continue;
        }
        const votedResult = await axios.get(serverUrl + `distribution/state/${i}/${address}`);
        hasVoted = votedResult.data.hasVoted;
        isActive = votedResult.data.isActive;
        const offChainElectionResult = await axios.get(serverUrl + `distribution/${i}`);
        const { election: offChainElection } = offChainElectionResult.data;
        const nVoted = Object.keys(offChainElection.votes).length;
        electionEntry.n_voted = {
          ...electionEntry.n_voted,
          n_voted: nVoted,
        };
      }

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
      let status = isActive;
      let created = new Date(election.date * 1000).toISOString().substring(0, 10);
      electionEntry = {
        ...electionEntry,
        id: i,
        created_date: created,
        name: election.name,
        creator: election.creator,
        status: status,
        tags: tags,
      };
      newElectionsMap.set(i, electionEntry);
    }
    console.log(newElectionsMap);
    return newElectionsMap;
  };

  const getElectionStateById = async id => {
    let election = {};
    let loadedElection = await readContracts.Diplomat.getElection(id);
    console.log(loadedElection);
    election = { ...loadedElection };
    election.isPaid = loadedElection.paid;
    election.fundingAmount = fromWei(loadedElection.amount.toString(), "ether");
    election.isCandidate = loadedElection.candidates.includes(address);
    election.isAdmin = loadedElection.creator === address;
    let votedStatus = false;
    console.log(election.kind);
    if (election.kind === "onChain") {
      votedStatus = await readContracts.Diplomat.getAddressVoted(id, address);
    }
    if (election.kind === "offChain") {
      const votedResult = await axios.get(serverUrl + `distribution/state/${id}/${address}`);
      const { hasVoted, isActive } = votedResult.data;
      votedStatus = hasVoted;
    }
    election.canVote = !votedStatus && election.isCandidate;
    return election;
  };

  const getCandidatesScores = async id => {
    const election = await readContracts.Diplomat.getElection(id);
    console.log(election.candidates);
    const scores = [];
    for (let i = 0; i < election.candidates.length; i++) {
      const candidateScore = (
        await readContracts.Diplomat.getElectionAddressScore(id, election.candidates[i])
      ).toNumber();
      console.log({ candidateScore });
      scores.push(candidateScore);
    }
    return scores;
  };

  const getFinalPayout = async id => {
    const election = await readContracts.Diplomat.getElection(id);
    const electionFunding = election.amount;
    const scores = [];
    const payout = [];
    const scoreSum = await readContracts.Diplomat.getElectionScoreTotal(id);
    console.log(scoreSum.toNumber());
    for (let i = 0; i < election.candidates.length; i++) {
      const candidateScore = (
        await readContracts.Diplomat.getElectionAddressScore(id, election.candidates[i])
      ).toNumber();
      console.log({ candidateScore });
      scores.push(candidateScore);

      const candidatePay = Math.floor((candidateScore / scoreSum) * electionFunding);
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

  const distributeEth = async (id, adrs, weiDist, totalValueInWei) => {
    console.log("Distributing...");
    return new Promise((resolve, reject) => {
      tx(
        writeContracts.Diplomat.payElection(id, adrs, weiDist, {
          value: totalValueInWei,
          gasLimit: 1245000,
        }),
        update => {
          console.log("📡 Transaction Update:", update);
          if (update && (update.status === "confirmed" || update.status === 1)) {
            resolve(update);
          } else {
            reject(update);
          }
        },
      );
    });
  };

  return {
    createElection,
    endElection,
    getElections,
    getElectionStateById,
    castBallot,
    getCandidatesScores,
    getFinalPayout,
    distributeEth,
  };
}
