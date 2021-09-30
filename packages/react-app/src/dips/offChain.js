import React, { useState, useEffect, useRef } from "react";
import { fromWei, toWei, toBN, numberToHex } from "web3-utils";

export default function OffChain(tx, readContracts, writeContracts, mainnetProvider, address) {
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
  };

  const castBallot = async (id, candidates, quad_scores) => {
    console.log(`casting ballot`);
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
