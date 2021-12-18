import React, { useEffect, useState } from "react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Button,
  Grid,
  GridItem,
  Textarea,
  Input,
  HStack,
} from "@chakra-ui/react";
import { LockIcon } from "@chakra-ui/icons";
import { useParams, useHistory } from "react-router-dom";
import DistributionCard from "../../components/Cards/DistributionCard";
import Container from "../../components/layout/Container";
import SideCard from "../../components/Cards/SideCard";
import VoteCard from "../../components/Cards/VoterCards/VoteCard";
import CeramicHandler from "../../dips/ceramicHandler";
import Confetti from "react-confetti";
import { PayButton } from "../../components";
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
