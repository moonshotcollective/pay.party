import React, { useEffect, useState } from "react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Box,
  Button,
  Grid,
  GridItem,
  Textarea,
} from "@chakra-ui/react";
import { LockIcon } from "@chakra-ui/icons";
import { useParams, useHistory } from "react-router-dom";
import DistributionCard from "../components/Cards/DistributionCard";
import Container from "../components/layout/Container";
import SideCard from "../components/Cards/SideCard";
import VoteCard from "../components/Cards/VoterCards/VoteCard";
import CeramicHandler from "../dips/ceramicHandler";
import Confetti from "react-confetti";
import { PayButton } from "../components";
import MongoDBController from "../controllers/mongodbController";

export default function Election({
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
  const [votesData, setVotesData] = useState(null);

  const db = new MongoDBController();

  useEffect(() => {
    db.fetchParty(id)
      .then(res => {
        setPartyData(res.data);
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleVotesChange = e => {
    const value = e.target.value;
    try {
      const parsedVotes = JSON.parse(value);
      setVotesData(parsedVotes);
    } catch (error) {
      console.log("Formatted JSON Required");
    }
  };

  const vote = async () => {
    // EIP-712 Typed Data
    // See: https://eips.ethereum.org/EIPS/eip-712
    const domain = {
      name: "pay-party",
      version: "1",
      chainId: targetNetwork.chainId,
      verifyingContract: readContracts.Diplomat.address,
    };
    const types = {
      Party: [
        { name: "party", type: "string" },
        { name: "ballot", type: "Ballot" },
      ],
      Ballot: [
        { name: "address", type: "address" },
        { name: "votes", type: "string" },
      ],
    };

    const ballot = {
      party: partyData.name,
      ballot: {
        address: address, //ethersContext.account,
        votes: JSON.stringify(votesData),
      },
    };

    if (partyData.ballots.valueOf(address).length < 1) {
      // Check if account has already submitted a ballot
      // NOTE: sign typed data for eip712 is underscored because it's in public beta
      userSigner
        ?._signTypedData(domain, types, ballot)
        .then(sig => {
          const ballots = props.partyData.ballots;
          // Push a ballot to the parties sumbitted ballots array
          ballots.push({ signature: sig, data: ballot });
          return ballots;
        })
        .then(ballots => {
          db.updateParty(props.partyData._id, { ballots: ballots });
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  return (
    <Container>
      <Grid w="full" templateColumns="repeat(3, 1fr)" gap={6}>
        <GridItem colSpan={1}>
          <Button
            onClick={() => {
              routeHistory.push("/");
            }}
          >
            Back
          </Button>
          <Box>
            <p>{partyData?._id}</p>
            <p>{partyData?.name}</p>
            <p>{partyData?.desc}</p>
            <p>Placeholder for more metadata</p>
          </Box>
        </GridItem>
        <GridItem colSpan={2}>
          <Box
            w="full"
            pt="1rem"
            align="end"
            borderColor="purple.500"
            borderWidth="1px"
            borderRadius="8px"
            py="3rem"
            px="2.5rem"
          >
            <p>Vote</p>
            <Textarea
              onChange={handleVotesChange}
              placeholder='ex: {"0x802999C71263f7B30927F720CF0AC10A76a0494C": 3, "0x6b541b78349097714B9D1aB6A788dB5e0dCF21a3": 7}'
            />
            <Button onClick={vote}>Cast Ballot</Button>
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
}
