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
          axios.post(serverUrl + "distributions", {
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
          resolve(update);
        } else {
          reject(update);
        }
      });
    });
  };

  const endElection = async id => {
    console.log(`Ending election`, id);
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
        // voteAllocation: voteAllocation,
        // members: filteredVoters,
        signature: signature,
      })
      .then(response => {
        console.log(response);
        // setCurrentDistribution(response);
        // setVoters([""]);
        // setVoteAllocation(0);
        form.resetFields();
        // setIsSendingTx(false);
        return response;
      })
      .catch(e => {
        console.log("Error on distributions post");
      });
  };

  const getElections = async () => {};

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

  const getCandidatesScores = async id => {};

  const getFinalPayout = async id => {};

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
