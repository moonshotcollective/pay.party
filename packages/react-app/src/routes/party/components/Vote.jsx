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
import React, { useState, useMemo } from "react";
import AddressChakra from "../../../components/AddressChakra";

export const Vote = ({ dbInstance, partyData, address, userSigner, targetNetwork, readContracts, mainnetProvider }) => {
  const [votesData, setVotesData] = useState({});
  const handleVotesChange = (event, adr) => {
    votesData[adr] = Number(event);
  };

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
        address: address,
        votes: JSON.stringify(votesData, null, 2),
      },
    };

    // NOTE: sign typed data for eip712 is underscored because it's in public beta
    if (partyData.participants.includes(address)) {
      userSigner
        ?._signTypedData(domain, types, ballot)
        .then(sig => {
          const ballots = partyData.ballots;
          const cast = ballots.valueOf(address).filter(d => d.data.ballot.address === address);
          // TODO: Check if account has already submitted a ballot
          if (cast.length === 0) {
            ballots.push({ signature: sig, data: ballot });
            return ballots;
          } else {
            throw "Error: Account already voted!";
          }
          // Push a ballot to the parties sumbitted ballots array
        })
        .then(ballots => {
          dbInstance.updateParty(partyData.id, { ballots: ballots });
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      console.log("Error: Account Not Participant!");
    }
  };

  const candidates = useMemo(() => {
    return partyData?.candidates.map(d => {
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
                onChange={e => {
                  handleVotesChange(e, d);
                }}
                width="6em"
                size="lg"
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
  }, [partyData]);

  return (
    <Box borderWidth={"1px"}>
      <Center pt={4}>
        <Text fontSize="lg">Cast Votes</Text>
      </Center>
      <Table>
        <Thead>
          <Tr>
            <Th>Address</Th>
            <Th>Score</Th>
          </Tr>
        </Thead>
        <TableCaption>
          <Button onClick={vote}>Vote</Button>
        </TableCaption>
        {candidates}
      </Table>
    </Box>
  );
};
