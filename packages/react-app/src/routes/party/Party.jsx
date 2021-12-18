import React, { useEffect, useState } from "react";
import {
  Box,
} from "@chakra-ui/react";
import { useParams, useHistory } from "react-router-dom";
import MongoDBController from "../../controllers/mongodbController";
import { Vote, Distribute } from "./components";

export default function Party({
  address,
  mainnetProvider,
  userSigner,
  targetNetwork,
  tx,
  readContracts,
  writeContracts,
  yourLocalBalance,
}) {
  const routeHistory = useHistory();
  let { id } = useParams();

  const [partyData, setPartyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const db = new MongoDBController();

  useEffect(() => {
    (async () => {
      const res = await db.fetchParty(id);
      setPartyData(res.data);
    })();
  }, []);

  return (
    <Box borderWidth={"1px"}>
      <p>{JSON.stringify(partyData)}</p>
      <Vote
        dbInstance={db}
        partyData={partyData}
        address={address}
        userSigner={userSigner}
        targetNetwork={targetNetwork}
        readContracts={readContracts}
      />
      <Distribute
        dbInstance={db}
        partyData={partyData}
        address={address}
        userSigner={userSigner}
        writeContracts={writeContracts}
        tx={tx}
      />
    </Box>
  );
}
