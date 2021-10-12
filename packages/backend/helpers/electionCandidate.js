const ethers = require("ethers");

const targetNetwork = {
  name: "localhost",
  color: "#666666",
  chainId: 31337,
  blockExplorer: "",
  rpcUrl: "http://localhost:8545",
};

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
console.log("🏠 Connecting to provider:", localProviderUrl);
const localProvider = new ethers.providers.StaticJsonRpcProvider(
  localProviderUrl
);

const isElectionCandidates = async (candidatesToCheck, electionId) => {
  const providerNetwork = await localProvider.getNetwork();
  const _chainId = providerNetwork.chainId;

  const contractList = require("./hardhat_contracts.json");
  console.log({ contractList });

  const contractData =
    contractList[_chainId][targetNetwork.name].contracts.Diplomat;
  const contract = new ethers.Contract(
    contractData.address,
    contractData.abi,
    localProvider
  );
  const [election] = await contract.functions.getElection(electionId);
  return election.candidates.every((candidate) =>
    candidatesToCheck.includes(candidate)
  );
};

module.exports = isElectionCandidates;
