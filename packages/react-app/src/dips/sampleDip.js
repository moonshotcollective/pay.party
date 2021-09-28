import { fromWei, toWei, toBN, numberToHex } from "web3-utils";

const createElection = async (data, tx, contract) => {
  console.log(`Saving election data`, data);
  const result = tx(
    contract.newElection(data.name, data.fundAmount, data.tokenAdr, data.votes, data.candidates),
    update => {
      console.log("📡 Transaction Update:", update);
    },
  );
  //   console.log(await result);
  return result;
};

const getElections = async (contract, address) => {
  const numElections = await contract.numElections();
  console.log({ numElections });
  const newElectionsMap = new Map();
  for (let i = 0; i < numElections; i++) {
    const election = await contract.getElectionById(i);
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

const getElectionVotes = async id => {
  console.log(`Fetching election data: `, id);

  return {};
};

const getElectionScores = async (contract, id) => {
  const election = await contract.getElectionById(id);
  const electionFunding = election.funds;
  const scores = [];
  const payout = [];
  const scoreSum = await contract.electionScoreSum(id);
  for (let i = 0; i < election.candidates.length; i++) {
    const candidateScore = (await contract.getElectionScore(id, election.candidates[i])).toNumber();
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

export default {
  createElection,
  getElectionVotes,
  getElectionScores,
  getElections,
};
