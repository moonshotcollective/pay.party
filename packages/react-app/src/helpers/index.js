import Ceramic from "@ceramicnetwork/http-client";
import { IDX } from "@ceramicstudio/idx";
import { EthereumAuthProvider, ThreeIdConnect } from "@3id/connect";
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";
import { DID } from "dids";
import ceramicConfig from "./../config.json";
export { default as Transactor } from "./Transactor";

export const makeCeramicClient = async address => {
  const ceramic = new Ceramic(process.env.CERAMIC_NODE_URL || "https://ceramic-clay.3boxlabs.com");
  const threeIdConnect = new ThreeIdConnect();
  const authProvider = new EthereumAuthProvider(window.ethereum, address);
  await threeIdConnect.connect(authProvider);
  const did = new DID({
    provider: threeIdConnect.getDidProvider(),
    resolver: ThreeIdResolver.getResolver(ceramic),
  });
  await did.authenticate();
  await ceramic.setDID(did);
  const idx = new IDX({ ceramic, aliases: ceramicConfig.definitions });
  return { ceramic, idx, schemasCommitId: ceramicConfig.schemas };
};
