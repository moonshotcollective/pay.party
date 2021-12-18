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
import React, { useEffect, useState } from "react";

export const Vote = ({ dbInstance, partyData, address, userSigner, targetNetwork, readContracts }) => {
  const [votesData, setVotesData] = useState(null);

  const handleVotesChange = e => {
    const value = e.target.value;
    try {
      const parsedVotes = JSON.parse(value);
      setVotesData(parsedVotes);
    } catch (error) {
      console.log("Formatted JSON Required");
    }
  };

  console.log(partyData);

  const vote = async () => {
    // EIP-712 Typed Data
    // See: https://eips.ethereum.org/EIPS/eip-712
    const domain = {
      name: "pay-party",
      version: "1",
      chainId: targetNetwork.chainId,
      verifyingContract: readContracts.Distributor.address,
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
        votes: JSON.stringify(votesData, null, 2),
      },
    };

    // TODO: Check if account has already submitted a ballot
    // if (partyData.ballots.valueOf(address).length < 1) {
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
        dbInstance.updateParty(partyData._id, { ballots: ballots });
      })
      .catch(err => {
        console.log(err);
      });
    // }
  };

  return (
    <Box borderWidth={"1px"}>
      <HStack>
        <Textarea onChange={handleVotesChange} placeholder='{"0x001...": 3, "0x002": 7, ...}'></Textarea>
        <Button onClick={vote}>Vote</Button>
      </HStack>
    </Box>
  );
};
