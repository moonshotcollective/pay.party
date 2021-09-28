import Ceramic from "@ceramicnetwork/http-client";
import { IDX } from "@ceramicstudio/idx";
import { EthereumAuthProvider, ThreeIdConnect } from "@3id/connect";
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";
import { DID } from "dids";
import ceramicConfig from "../config.json";

export const makeCeramicClient = async (address: string) => {
  const ceramic = new Ceramic(
    process.env.CERAMIC_NODE_URL || "https://ceramic-clay.3boxlabs.com"
  );
  const threeIdConnect = new ThreeIdConnect();
  const authProvider = new EthereumAuthProvider(
    (window as any).ethereum,
    address
  );
  await threeIdConnect.connect(authProvider);
  const did = new DID({
    provider: threeIdConnect.getDidProvider(),
    resolver: ThreeIdResolver.getResolver(ceramic),
  });
  await did.authenticate();
  await ceramic.setDID(did);
  const idx = new IDX({ ceramic, aliases: (ceramicConfig as any).definitions });
  return { ceramic, idx, schemasCommitId: (ceramicConfig as any).schemas };
};
