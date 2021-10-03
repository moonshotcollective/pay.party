// import handler for specific QDip project
import onChainHandler from "./onChain";
import offChainHandler from "./offChain";

// create DQip type and add details for the UI
export const handlers = {
  // TODO: base handler for common cases
  baseHandler: {},
  offChain: {
    id: 0,
    name: "Off-chain",
    description: "Election data is stored on backend.",
    handler: offChainHandler,
  },
  onChain: {
    id: 1,
    name: "On-chain (votes & election)",
    description: "",
    handler: onChainHandler,
  },
  //   ipfs: {
  //     name: "IPFS (votes only)",
  //     description: "",
  //     handler: null,
  //   },
  //   offChain: {
  //     name: "Off-chain (votes only)",
  //     description: "",
  //     handler: null,
  //   },
};
