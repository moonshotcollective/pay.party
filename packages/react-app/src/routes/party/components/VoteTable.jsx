import {
  Box,
  Button,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Center,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
} from "@chakra-ui/react";
import React, { useState, useMemo, useEffect } from "react";
import AddressChakra from "../../../components/AddressChakra";

export const VoteTable = ({ partyData, address, userSigner, targetNetwork, readContracts, mainnetProvider }) => {
  // Init votes data to 0 votes for each candidate
  const [votesData, setVotesData] = useState(null);
  // Init votes left to nvotes
  const [votesLeft, setVotesLeft] = useState(null);
  const [invalidVotesLeft, setInvalidVotesLeft] = useState(false);

  useEffect(
    _ => {
      try {
        setVotesData(partyData.candidates.reduce((o, key) => ({ ...o, [key]: 0 }), {}));
        setVotesLeft(partyData.config.nvotes);
      } catch (error) {
        // Do something?
        console.log(error);
      }
    },
    [partyData],
  );

  const handleVotesChange = (event, adr) => {
    votesData[adr] = Number(event);
    const spent = Object.values(votesData).reduce((a, b) => a + b);
    setVotesLeft(partyData.config.nvotes - spent);
    setInvalidVotesLeft(spent > partyData.config.nvotes);
  };

  const vote = async _ => {
    try {
      // EIP-712 Typed Data
      // See: https://eips.ethereum.org/EIPS/eip-712
      const domain = {
        name: "pay-party",
        version: "1",
        chainId: targetNetwork.chainId,
        verifyingContract: readContracts?.Distributor?.address,
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
          address: address,
          votes: JSON.stringify(votesData, null, 2),
        },
      };

      // NOTE: sign typed data for eip712 is underscored because it's in public beta
      if (partyData.participants.map(adr => adr.toLowerCase()).includes(address) && !invalidVotesLeft) {
        const ballots = partyData.ballots;
        const cast = ballots.valueOf(address).filter(d => d.data.ballot.address === address);
        if (cast.length === 0) {
          return userSigner
            ?._signTypedData(domain, types, ballot)
            .then(sig => {
              return { signature: sig, data: ballot };
            })
            .then(async b => {
              await fetch(`${process.env.REACT_APP_API_URL}/party/${partyData.id}/vote`, {
                method: "put",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(b),
              });
            })
            .then(_ => {
              window.location.reload(false);
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          throw "Error: Account already voted!";
        }
      } else {
        throw "Error: Invalid Ballot!";
      }
    } catch (error) {
      console.log(error);
      console.log("Error: Failed to cast ballot!");
    }
  };

  const candidates = useMemo(
    _ => {
      let c;
      try {
        c = partyData.candidates.map(d => {
          return (
            <Tbody key={`vote-row-${d}`}>
              <Tr>
                <Td>
                  <AddressChakra
                    address={d}
                    ensProvider={mainnetProvider}
                    // blockExplorer={blockExplorer}
                  />
                </Td>
                <Td>
                  <NumberInput
                    defaultValue={0}
                    min={0}
                    max={partyData.config.nvotes}
                    onChange={e => {
                      handleVotesChange(e, d);
                    }}
                    width="6em"
                    size="lg"
                    isInvalid={invalidVotesLeft}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Td>
              </Tr>
            </Tbody>
          );
        });
      } catch (error) {
        console.log(error);
        c = [];
      }
      return c;
    },
    [partyData, votesLeft],
  );

  return (
    <Box>
      <Center pt={4}>
        <Text fontSize="lg">Remaining Votes:</Text>
      </Center>
      <Center pb="3">
        <Text fontWeight="semibold" fontSize="lg">
          {votesLeft}
        </Text>
      </Center>
      <Table borderWidth="1px">
        <Thead>
          <Tr>
            <Th>Address</Th>
            <Th>Score</Th>
          </Tr>
        </Thead>
        <TableCaption>
          <Button onClick={vote} disabled={invalidVotesLeft}>
            Vote
          </Button>
        </TableCaption>
        {candidates}
      </Table>
    </Box>
  );
};
