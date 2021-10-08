import Ceramic from "@ceramicnetwork/http-client";
import { IDX } from "@ceramicstudio/idx";
import { EthereumAuthProvider, ThreeIdConnect } from "@3id/connect";
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";
import KeyDidResolver from "key-did-resolver";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { fromString, toString } from "uint8arrays";
import { randomBytes } from "@stablelib/random";
import { DID } from "dids";
import ceramicConfig from "./../config.json";
export { default as Transactor } from "./Transactor";
export const makeCeramicClient = async address => {
  const ceramic = new Ceramic(process.env.CERAMIC_NODE_URL || "https://ceramic-clay.3boxlabs.com");
  if (address) {
    const threeIdConnect = new ThreeIdConnect();
    const authProvider = new EthereumAuthProvider(window.ethereum, address);
    await threeIdConnect.connect(authProvider);
    const did = new DID({
      provider: threeIdConnect.getDidProvider(),
      resolver: ThreeIdResolver.getResolver(ceramic),
    });
    await did.authenticate();
    await ceramic.setDID(did);
  } else {
    if (!process.env.REACT_APP_CERAMIC_SEED) {
      console.warn("REACT_APP_CERAMIC_SEED not found in .env, generating a new seed..");
      const newSeed = toString(randomBytes(32), "base16");
      console.log(`Seed generated. Save this in your .env as REACT_APP_CERAMIC_SEED=${newSeed}`);
      process.env.REACT_APP_CERAMIC_SEED = newSeed;
    }
    const keyDidResolver = KeyDidResolver.getResolver();
    const threeIdResolver = ThreeIdResolver.getResolver(ceramic);
    const resolverRegistry = {
      ...threeIdResolver,
      ...keyDidResolver,
    };
    const did = new DID({
      provider: new Ed25519Provider(fromString(process.env.REACT_APP_CERAMIC_SEED, "base16")),
      resolver: resolverRegistry,
    });
    await did.authenticate();
    await ceramic.setDID(did);
  }

  const idx = new IDX({ ceramic, aliases: ceramicConfig.definitions });
  return { ceramic, idx, schemasCommitId: ceramicConfig.schemas, definitions: ceramicConfig.definitions };
};
