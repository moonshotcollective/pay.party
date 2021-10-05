// import handler for specific QDip project
import { default as OnChain } from "./onChain";
import { default as OffChain } from "./offChain";
import CeramicHandler from "./ceramicHandler";

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
  ceramic: {
    id: 2,
    name: "Ceramic (votes & election)",
    description: "",
    handler: CeramicHandler,
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
