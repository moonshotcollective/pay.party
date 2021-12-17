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

  console.log(partyData)

  const [tokenInstance, setTokenInstance] = useState(null);

  // load an erc20
  // TODO: add capability for other block explorers
  const loadToken = async (values) => {
    $.getJSON(
      `https://api.etherscan.io/api?module=contract&action=getabi&address=${values.token}&${
        process.env.REACT_APP_ETHERSCAN_KEY
      }`,
      (data) => {
        const contractABI = JSON.parse(data.result);
        var contractInstance = new ethers.Contract(values.token, contractABI, ethersContext.signer);
        setTokenInstance(contractInstance);
      }
    );
    console.log(tokenInstance);
  };

  const approve = () => {

  }

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
          const ballots = partyData.ballots;
          // Push a ballot to the parties sumbitted ballots array
          ballots.push({ signature: sig, data: ballot });
          return ballots;
        })
        .then(ballots => {
          db.updateParty(partyData._id, { ballots: ballots });
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  return (
      <Box borderWidth={'1px'}>
        <p>{JSON.stringify(partyData)}</p>

      </Box>
  );
}
