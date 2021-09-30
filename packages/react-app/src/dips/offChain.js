import React, { useState, useEffect, useRef } from "react";
import { fromWei, toWei, toBN, numberToHex } from "web3-utils";
const axios = require("axios");

const serverUrl = "http://localhost:45622/";

export default function OffChain(tx, readContracts, writeContracts, mainnetProvider, address, userSigner) {
  const createElection = async data => {
    console.log(`Saving election data off-chain`, data);
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
  };

  const castBallot = async (id, candidates, quad_scores) => {

    console.log(`casting ballot in offChain()`);
      let message = "qdip-vote-" + address; //+ voteAllocation + filteredVoters.join();
      console.log("Message:" + message);
      let signature = await userSigner.provider.send("personal_sign", [message, address]);


        axios
        .post(serverUrl + "distributions/" + id + "/vote" , {
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
        })
        .catch(e => {
          console.log("Error on distributions post");
        });

  };

  const getElections = async () => {};

  const getElectionStateById = async id => {};

  const getCandidatesScores = async id => {};

  const getFinalPayout = async id => {};

  const distributeEth = async (id, adrs, weiDist, totalValueInWei) => {};

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
