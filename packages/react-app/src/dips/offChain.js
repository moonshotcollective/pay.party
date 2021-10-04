import React, { useState, useEffect, useRef } from "react";
import { fromWei, toWei, toBN, numberToHex } from "web3-utils";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import axios from "axios";
import Diplomat from "../contracts/hardhat_contracts.json";

export const serverUrl = process.env.REACT_APP_API_URL || "http://localhost:45622/";

export default function OffChain(tx, readContracts, writeContracts, mainnetProvider, address, userSigner) {
  const createElection = async ({ name, candidates, fundAmount, tokenAdr, votes, kind }) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const network = await provider.getNetwork();
    let contract = new ethers.Contract(
      Diplomat[network.chainId][network.name].contracts.Diplomat.address,
      Diplomat[network.chainId][network.name].contracts.Diplomat.abi,
      signer,
    );
    let transaction = await contract.createElection(name, candidates, fundAmount, tokenAdr, votes, kind);
    const receipt = await transaction.wait();
    console.log(address);
    const onChainElectionId = receipt.events[0].args.electionId.toNumber();
    const message = "qdip-create-" + address;
    const signature = await provider.send("personal_sign", [message, address]);
    console.log("new election created", onChainElectionId);
    const result = await axios.post(serverUrl + "distributions", {
      onChainElectionId,
      name,
      candidates,
      fundAmount,
      tokenAdr,
      votes,
      kind,
      address,
      signature,
    });
    console.log(result.data);
    return result.data.success;
    // // const result = await
    // return new Promise((resolve, reject) => {
    //   tx(
    //     writeContracts.Diplomat.createElection(name, candidates, fundAmount, tokenAdr, votes, kind, {
    //       gasLimit: 12450000,
    //     }),
    //     async update => {
    //       console.log("📡 Transaction Update:", update);
    //       if (update && (update.status === "confirmed" || update.status === 1)) {
    //         if (typeof result.wait === "function") {
    //           const receipt = await update.wait();
    //           console.log(address);
    //           const onChainElectionId = receipt.events[0].args.electionId.toNumber();
    //           const message = "qdip-create-" + address;
    //           const signature = await userSigner.provider.send("personal_sign", [message, address]);
    //           console.log("new election created", onChainElectionId);
    //           return axios
    //             .post(serverUrl + "distributions", {
    //               onChainElectionId,
    //               name,
    //               candidates,
    //               fundAmount,
    //               tokenAdr,
    //               votes,
    //               kind,
    //               address,
    //               signature,
    //             })
    //             .then(res => {
    //               console.log(res.data, res.data.success);
    //               resolve(res.data.success);
    //             })
    //             .catch(reject);
    //         }
    //         resolve(update);
    //       } else {
    //         reject(update);
    //       }
    //     },
    //   );
    // });
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

      const votedResult = await axios.get(serverUrl + `distribution/${i}/${address}`);
      const { hasVoted } = votedResult.data;

      const offChainElectionResult = await axios.get(serverUrl + `distribution/${i}`);
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
      let created = new Date(election.date * 1000).toISOString().substring(0, 10);
      let electionEntry = {
        id: i,
        created_date: created,
        name: election.name,
        creator: election.creator,
        n_voted: { n_voted: nVoted, outOf: election.candidates.length },
        active: election.active,
        tags: tags,
      };
      newElectionsMap.set(i, electionEntry);
    }
    console.log({ newElectionsMap });
    return newElectionsMap;
  };

  const getElectionStateById = async id => {
    // let election = {};
    let election = await readContracts.Diplomat.getElection(id);
    // election = { ...loadedElection };
    // election.isPaid = loadedElection.paid;
    // election.fundingAmount = fromWei(loadedElection.amount.toString(), "ether");
    // election.isCandidate = loadedElection.candidates.includes(address);
    // election.isAdmin = loadedElection.creator === address;

    // const votedResult = await axios.get(serverUrl + `distribution/state/${id}/${address}`);
    // const { hasVoted, isActive } = votedResult.data;
    // election.canVote = !hasVoted && election.isCandidate;
    // console.log({ isActive });
    // election.active = isActive;
    // const electionTest = await contract.getElection(id);
    // console.log({ election });
    let electionEntry = {
      n_voted: { outOf: election.candidates.length },
    };
    let hasVoted = false;
    let isActive = false;
    if (election.kind === "onChain") {
      hasVoted = await contract.getAddressVoted(id, address);
      isActive = election.active;
      console.log({ hasVoted });
      const electionVoted = await contract.getElectionNumVoted(id);
      electionEntry.n_voted = {
        ...electionEntry.n_voted,
        n_voted: electionVoted.toNumber(),
      };
    }
    if (election.kind === "offChain") {
      const votedResult = await axios.get(serverUrl + `distribution/state/${id}/${address}`);
      hasVoted = votedResult.data.hasVoted;
      isActive = votedResult.data.isActive;
      const offChainElectionResult = await axios.get(serverUrl + `distribution/${id}`);
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
    const created = new Date(election.date * 1000).toISOString().substring(0, 10);
    const isCandidate = election.candidates.includes(address);
    const formattedElection = {
      ...electionEntry,
      id: id,
      created_date: created,
      isPaid: election.paid,
      isCandidate,
      isAdmin: election.creator === address,
      name: election.name,
      voteAllocation: election.votes,
      canVote: !hasVoted && isCandidate,
      amount: fromWei(election.amount.toString(), "ether"),
      creator: election.creator,
      active: isActive,
      tags: tags,
      candidates: election.candidates,
    };
    return formattedElection;
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
