require("dotenv").config();
const Ceramic = require("@ceramicnetwork/http-client").default;
const { IDX } = require("@ceramicstudio/idx");
const { EthereumAuthProvider, ThreeIdConnect } = require("@3id/connect");
const ThreeIdResolver = require("@ceramicnetwork/3id-did-resolver").default;
const KeyDidResolver = require("key-did-resolver").default;
const { Ed25519Provider } = require("key-did-provider-ed25519");
const { createDefinition, publishSchema } = require("@ceramicstudio/idx-tools");
const { DID } = require("dids");
const fs = require("fs");
const { fromString, toString } = require("uint8arrays");
const { randomBytes } = require("@stablelib/random");
const schemas = require("./schemas");

async function makeCeramicClient() {
  const ceramicConfig = await fs.promises.readFile("./src/config.json");
  if (!process.env.REACT_APP_CERAMIC_SEED) {
    console.warn("REACT_APP_CERAMIC_SEED not found in .env, generating a new seed..");
    const newSeed = toString(randomBytes(32), "base16");
    console.log(`Seed generated. Save this in your .env as REACT_APP_CERAMIC_SEED=${newSeed}`);
    process.env.REACT_APP_CERAMIC_SEED = newSeed;
  }
  const ceramic = new Ceramic(process.env.CERAMIC_URL || "https://ceramic-clay.3boxlabs.com");
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

  // Publish all the schemas and create their definitions referenced by an alias
  const aliases = {};
  const schemasCommitId = {};

  for (const [schemaName, schema] of Object.entries(schemas)) {
    const publishedSchema = await publishSchema(ceramic, {
      content: schema,
      name: schemaName,
    });
    const publishedSchemaCommitId = publishedSchema.commitId.toUrl();
    schemasCommitId[schemaName] = publishedSchemaCommitId;

    const createdDefinition = await createDefinition(ceramic, {
      name: schemaName,
      description: `Q-Dip schema for ${schemaName}`,
      schema: publishedSchemaCommitId,
    });
    aliases[schemaName] = createdDefinition.id.toString();
  }

  // Write config to JSON file
  const config = {
    definitions: aliases,
    schemas: schemasCommitId,
  };
  await fs.promises.writeFile("./src/config.json", JSON.stringify(config));

  const idx = new IDX({ ceramic, aliases });
  return { ceramic, idx, schemasCommitId };
}

(async () => {
  await makeCeramicClient();
})();
