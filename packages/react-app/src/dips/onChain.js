import React, { useState, useEffect, useRef } from "react";
import { fromWei, toWei, toBN, numberToHex } from "web3-utils";

export default function OnChain(tx, readContracts, writeContracts, mainnetProvider, address) {
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
          data.selectedDip, 
        ),
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
      tx(writeContracts.Diplomat.endElection(id), update => {
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
      tx(writeContracts.Diplomat.vote(id, candidates, quad_scores, {gasLimit: 12450000}), update => {
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
    const contract = readContracts.Diplomat;
    const numElections = await contract.electionCount();
    console.log({numElections});
    const newElectionsMap = new Map();
    for (let i = 0; i < numElections; i++) {
      const election = await contract.getElection(i);
      
      const electionVoted = await contract.getElectionVoted(i);
      const hasVoted = await contract.getAddressVoted(i, address);

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
    let loadedElection = await readContracts.Diplomat.getElection(id);
    election = { ...loadedElection };
    election.isPaid = loadedElection.paid;
    election.fundingAmount = fromWei(loadedElection.amount.toString(), "ether");
    election.isCandidate = loadedElection.candidates.includes(address);
    election.isAdmin = loadedElection.creator === address;
    const votedStatus = await readContracts.Diplomat.addressVoted(id, address);
    election.canVote = !votedStatus && election.isCandidate;
    return election;
  };

  const getCandidatesScores = async id => {
    const election = await readContracts.Diplomat.getElection(id);
    const scores = [];
    for (let i = 0; i < election.candidates.length; i++) {
      const candidateScore = (await readContracts.Diplomat.getScore(id, election.candidates[i])).toNumber();
      scores.push(candidateScore);
    }
    return scores;
  };

  const getFinalPayout = async id => {
    const election = await readContracts.Diplomat.getElection(id);
    const electionFunding = election.amount;
    const scores = [];
    const payout = [];
    const scoreSum = await readContracts.Diplomat.electionScoreTotal(id);
    for (let i = 0; i < election.candidates.length; i++) {
      const candidateScore = (await readContracts.Diplomat.getScore(id, election.candidates[i])).toNumber();
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
        writeContracts.Diplomat.payoutElection(id, adrs, weiDist, {
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