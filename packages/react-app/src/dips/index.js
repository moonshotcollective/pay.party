// import handler for specific QDip project
import { default as OnChain } from "./onChain";
import BaseHandler from "./baseHandler";
import { default as OffChain } from "./offChain";
import CeramicHandler from "./ceramicHandler";

// create DQip type and add details for the UI
export default {
  // base: {
  //   id: 0,
  //   handler: BaseHandler,
  // },
  // offChain: {
  //   id: 0,
  //   name: "Firebase (Centralized)",
  //   description: "Election data is stored on backend.",
  //   handler: OffChain,
  // },
  ceramic: {
    id: 0,
    name: "Ceramic (Decentralized)",
    description: "",
    handler: CeramicHandler,
  },
};
