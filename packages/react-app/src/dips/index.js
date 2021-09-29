// import handler for specific QDip project
import { default as OnChain } from "./onChain";

// create DQip type and add details for the UI
export default {
  eventDriven: {
    id: 0,
    name: "On-chain event driven",
    description: "Election data is stored using contract events (not memory).",
    handler: OnChain,
  },
  onChain: {
    id: 1,
    name: "On-chain (votes & election)",
    description: "",
    handler: OnChain,
  },
  ipfs: {
    name: "IPFS (votes only)",
    description: "",
    handler: null,
  },
  offChain: {
    name: "Off-chain (votes only)",
    description: "",
    handler: null,
  },
};
