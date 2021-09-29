// import handler for specific QDip project
import { default as OnChain } from "./onChain";
import { default as OffChain } from "./offChain";

// create DQip type and add details for the UI
export default {
  offChain: {
    id: 0,
    name: "Off-chain",
    description: "Election data is stored on backend.",
    handler: OffChain,
  },
  onChain: {
    id: 1,
    name: "On-chain (votes & election)",
    description: "",
    handler: OnChain,
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
