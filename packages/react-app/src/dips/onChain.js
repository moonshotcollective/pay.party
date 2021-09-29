import React, { useState, useEffect, useRef } from "react";
import { fromWei, toWei, toBN, numberToHex } from "web3-utils";

export default function OnChain(tx, readContracts, writeContracts, mainnetProvider, address) {
  const createElection = async data => {
    console.log(`Saving election data`, data);
    return new Promise((resolve, reject) => {
      tx(
        writeContracts.Diplomacy.newElection(data.name, data.fundAmount, data.tokenAdr, data.votes, data.candidates, {
          value: 0,
          gasLimit: 124500,
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

  const endElection = async id => {
    console.log(`Ending election`, id);
    return new Promise((resolve, reject) => {
      tx(writeContracts.Diplomacy.endElection(id), update => {
        console.log("📡 Transaction Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          resolve(update);
        } else {
          reject(update);
        }
      });
    });
  };

  const castBallot = async (id, candidates, quad_scores) => {
    console.log(`casting ballot`);
    return new Promise((resolve, reject) => {
      tx(writeContracts.Diplomacy.castBallot(id, candidates, quad_scores), update => {
        console.log("📡 Transaction Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          resolve(update);
        } else {
          reject(update);
        }
      });
    });
  };

  const getElections = async () => {
    const contract = readContracts.Diplomacy;
    const numElections = await contract.numElections();
    console.log("numElections ", numElections.toNumber());
    const newElectionsMap = new Map();
    for (let i = 0; i < numElections; i++) {
      const election = await contract.getElectionById(i);
      //   console.log({ election });
      const electionVoted = await contract.getElectionVoted(i);
      const hasVoted = await contract.hasVoted(i, address);

      const tags = [];
      if (election.admin === address) {
        tags.push("admin");
      }
      if (election.candidates.includes(address)) {
        tags.push("candidate");
      }
      if (hasVoted) {
        tags.push("voted");
      }
      let status = election.isActive;
      let created = new Date(election.createdAt.toNumber() * 1000).toISOString().substring(0, 10);
      let electionEntry = {
        id: i,
        created_date: created,
        name: election.name,
        creator: election.admin,
        n_voted: { n_voted: electionVoted.toNumber(), outOf: election.candidates.length },
        status: status,
        tags: tags,
      };
      newElectionsMap.set(i, electionEntry);
    }
    return newElectionsMap;
  };

  const getElectionStateById = async id => {
    let election = {};
    let loadedElection = await readContracts.Diplomacy.getElectionById(id);
    election = { ...loadedElection };
    election.isPaid = loadedElection.paid;
    election.fundingAmount = fromWei(loadedElection.funds.toString(), "ether");
    election.isCandidate = loadedElection.candidates.includes(address);
    election.isAdmin = loadedElection.admin === address;
    const votedStatus = await readContracts.Diplomacy.hasVoted(id, address);
    election.canVote = !votedStatus && election.isCandidate;
    return election;
  };

  const getCandidatesScores = async id => {
    const election = await readContracts.Diplomacy.getElectionById(id);
    const scores = [];
    for (let i = 0; i < election.candidates.length; i++) {
      const candidateScore = (await readContracts.Diplomacy.getElectionScore(id, election.candidates[i])).toNumber();
      scores.push(candidateScore);
    }
    return scores;
  };

  const getFinalPayout = async id => {
    const election = await readContracts.Diplomacy.getElectionById(id);
    const electionFunding = election.funds;
    const scores = [];
    const payout = [];
    const scoreSum = await readContracts.Diplomacy.electionScoreSum(id);
    for (let i = 0; i < election.candidates.length; i++) {
      const candidateScore = (await readContracts.Diplomacy.getElectionScore(id, election.candidates[i])).toNumber();
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
    return new Promise((resolve, reject) => {
      tx(
        writeContracts.Diplomacy.payoutElection(id, adrs, weiDist, {
          value: totalValueInWei,
          gasLimit: 12450000,
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
