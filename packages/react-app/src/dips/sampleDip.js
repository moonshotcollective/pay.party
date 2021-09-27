const createElection = async data => {
  console.log(`Saving election data`, data);
};

const getElectionVotes = async id => {
  console.log(`Fetching election data: `, id);

  return {};
};

export default {
  createElection,
  getElectionVotes,
};
