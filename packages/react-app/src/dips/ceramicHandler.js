import React, { useState, useEffect, useRef } from "react";
import { fromWei, toWei, toBN, numberToHex } from "web3-utils";
import { Caip10Link } from "@ceramicnetwork/stream-caip10-link";

import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import axios from "axios";
import Diplomat from "../contracts/hardhat_contracts.json";
import { makeCeramicClient } from "../helpers";
import { getCeramicElectionIds, getNetwork, serializeCeramicElection, toCeramicId } from "./helpers";
import { serverUrl } from "./baseHandler";

export default function CeramicHandler(tx, readContracts, writeContracts, mainnetProvider, address, userSigner) {
  const createElection = async ({ name, candidates, fundAmount, tokenAdr, votes, kind }) => {
    const { network, signer } = await getNetwork();
    /* CREATE CERAMIC ELECTION */
    const { ceramic, idx, schemasCommitId } = await makeCeramicClient(address);
    // current users' existing elections
    const existingElections = await idx.get("elections");
    const previousElections = existingElections ? Object.values(existingElections) : null;

    // make sure the user is Authenticated
    if (ceramic?.did?.id) {
      console.log({ kind });
      // create the election document on Ceramic
      const electionDoc = await TileDocument.create(
        ceramic,
        {
          name,
          candidates,
          kind: "ceramic",
          voteAllocation: votes,
          tokenAddress: tokenAdr,
          fundAmount,
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

      const electionId = electionDoc.id.toUrl();

      /* CREATE ELECTION ON-CHAIN (push the ceramic commitId to elections array) */
      let contract = new ethers.Contract(
        Diplomat[network.chainId][network.name].contracts.Diplomat.address,
        Diplomat[network.chainId][network.name].contracts.Diplomat.abi,
        signer,
      );
      let transaction = await contract.createElection(electionId);
      const receipt = await transaction.wait();
      const id = receipt.events[0].args.electionId;
      return id;
    }
  };

  const endElection = async id => {
    const { idx, ceramic } = await makeCeramicClient(address);
    const electionDoc = await TileDocument.load(ceramic, id);
    console.log(electionDoc.controllers[0], ceramic.did.id.toString());
    if (electionDoc.controllers[0] === ceramic.did.id.toString()) {
      const updated = await electionDoc.update({ ...electionDoc.content, isActive: false });
      return updated;
    }
  };

  const castBallot = async (id, candidates, quad_scores) => {
    const { idx, ceramic, schemasCommitId } = await makeCeramicClient(address);
    const election = await serializeCeramicElection(id, address);

    const existingVotes = await idx.get("votes");
    // TODO: check if already voted for this election through another address linked to this did
    const previousVotes = existingVotes ? Object.values(existingVotes) : null;
    const hasAlreadyVotedForElec = previousVotes && previousVotes.find(vote => vote.electionId === id);
    if (hasAlreadyVotedForElec) {
      console.error("Already voted for this election");
      return election.totalScores;
    }

    const voteAttribution = quad_scores.map((voteAttributionCount, i) => ({
      address: election.candidates[i],
      voteAttribution: voteAttributionCount,
    }));

    if (ceramic?.did?.id) {
      const ballotDoc = await TileDocument.create(ceramic, voteAttribution, {
        controllers: [ceramic.did.id],
        family: "vote",
        schema: schemasCommitId.vote,
      });
      // https://developers.ceramic.network/learn/glossary/#anchor-commit
      // https://developers.ceramic.network/learn/glossary/#anchor-service
      const anchorStatus = await ballotDoc.requestAnchor();
      await ballotDoc.makeReadOnly();
      Object.freeze(ballotDoc);

      const previousVotes = (await idx.get("votes", ceramic.did.id)) || {};
      await idx.set("votes", [
        { id: ballotDoc.id.toUrl(), electionId: toCeramicId(id) },
        ...Object.values(previousVotes),
      ]);

      const sealedBallot = ballotDoc.commitId.toUrl();
    }

    const electionResults = await serializeCeramicElection(id, address);
    return electionResults.totalScores;
  };

  const getElections = async () => {
    const contract = readContracts.Diplomat;
    const elections = await getCeramicElectionIds(contract);
    const newElectionsMap = new Map();
    const { idx, ceramic } = await makeCeramicClient();

    for (let i = 0; i < elections.length; i++) {
      const election = await serializeCeramicElection(elections[i], address);
      newElectionsMap.set(elections[i], election);
    }
    return newElectionsMap;
  };

  const getElectionStateById = async id => {
    const { idx, ceramic } = await makeCeramicClient();
    const election = await serializeCeramicElection(id, address);
    return election;
  };

  const getCandidatesScores = async id => {
    const { idx, ceramic } = await makeCeramicClient();
    const election = await serializeCeramicElection(id, address);
    return election.totalScores;
  };

  const getFinalPayout = async id => {
    const { idx, ceramic } = await makeCeramicClient();
    const election = await serializeCeramicElection(id, address);
    let payout = [];
    console.log({ payout });
    let totalScoresSum = election.totalScores.reduce((sum, curr) => sum + curr, 0);
    let scores = [];

    for (let i = 0; i < election.candidates.length; i++) {
      const candidateScore = election.votes[election.candidates[i]];
      console.log({ candidateScore });
      let scoreSum = 0;
      if (!candidateScore) {
        scores.push(candidateScore);
        scoreSum += candidateScore;
      } else {
        scores.push(0);
      }
    }

    for (let i = 0; i < election.totalScores.length; i++) {
      const candidatePay = Math.floor((election.totalScores[i] / totalScoresSum) * election.fundAmount);
      if (!isNaN(candidatePay)) {
        payout.push(fromWei(candidatePay.toString()));
      } else {
        payout.push(0);
      }
    }
    return {
      scores: election.totalScores,
      payout: payout,
      scoreSum: totalScoresSum,
    };
  };

  const distributeEth = async ({ id, candidates, payoutInWei, totalValueInWei, tokenAddress }) => {
    const { ceramic } = await makeCeramicClient(address);
    const { network, signer } = await getNetwork();
    console.log({ signer });
    const contract = new ethers.Contract(
      Diplomat[network.chainId][network.name].contracts.Diplomat.address,
      Diplomat[network.chainId][network.name].contracts.Diplomat.abi,
      signer,
    );

    console.log({ id, candidates, tokenAddress, totalValueInWei, payoutInWei });

    const transaction = await contract.payElection(id, candidates, payoutInWei, tokenAddress, {
      value: totalValueInWei,
    });
    const receipt = await transaction.wait();
    console.log({ receipt });
    const electionDoc = await TileDocument.load(ceramic, id);
    console.log(electionDoc.controllers[0], ceramic.did.id.toString());
    if (electionDoc.controllers[0] === ceramic.did.id.toString()) {
      await electionDoc.update({ ...electionDoc.content, isPaid: true });
    }

    return receipt;
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
