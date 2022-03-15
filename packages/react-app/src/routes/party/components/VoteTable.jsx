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
import {
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
} from "@chakra-ui/react";
import { EditIcon, CheckIcon } from "@chakra-ui/icons";
import React, { useState, useMemo, useEffect, useRef } from "react";
import AddressChakra from "../../../components/AddressChakra";

export const VoteTable = ({ partyData, address, userSigner, targetNetwork, readContracts, mainnetProvider }) => {
  // Init votes data to 0 votes for each candidate
  const [votesData, setVotesData] = useState(null);
  // Init votes left to nvotes
  const [votesLeft, setVotesLeft] = useState(null);
  const [candidateNote, setCandidateNote] = useState("");
  const [invalidVotesLeft, setInvalidVotesLeft] = useState(false);
  const [blockNumber, setBlockNumber] = useState("-1");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef();
  const finalRef = React.useRef();
  mainnetProvider.on("block", bn => {
    setBlockNumber(bn.toString());
  });

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

  const newCandidateNote = async _ => {
    const note = {
      candidate: address,
      message: candidateNote,
      signature: "",
    };

    const res = await fetch(`${process.env.REACT_APP_API_URL}/party/${partyData.id}/note`, {
      method: "put",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });
    onClose();
  };

  const vote = async _ => {
    try {
      // TODO: Put this data model in a seperate file for organization
      // EIP-712 Typed Data
      // See: https://eips.ethereum.org/EIPS/eip-712
      const domain = {
        name: "pay-party",
        version: "1",
        chainId: partyData.config.chainId,
        verifyingContract: readContracts?.Distributor?.address,
      };
      const types = {
        Party: [{ name: "ballot", type: "Ballot" }],
        Ballot: [
          { name: "votes", type: "string" },
          { name: "timestamp", type: "string" },
          { name: "partySignature", type: "string" },
        ],
      };
      const ballot = {
        ballot: {
          votes: JSON.stringify(votesData, null, 2),
          timestamp: blockNumber,
          partySignature: partyData.signed.signature,
        },
      };

      //console.log(domain, types);

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
                <Text>
                  {partyData.notes?.filter(n => n.candidate.toLowerCase() === d.toLowerCase()).reverse()[0]?.message}
                </Text>
                  {d.toLowerCase() === address.toLowerCase() ? (
                    <Button size="xs" rightIcon={<EditIcon />} variant="link" ml="1" onClick={onOpen}>
                      Edit
                    </Button>
                  ) : null}
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
    [partyData, votesLeft, address],
  );

  const editNoteModal = (
    <Modal initialFocusRef={initialRef} finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update your Note</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl>
            <Input
              onChange={e => {
                setCandidateNote(e.target.value);
              }}
              ref={initialRef}
              placeholder="Enter your note here"
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={newCandidateNote}>
            Submit
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
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
            <Th>Note</Th>
            <Th>Score</Th>
          </Tr>
        </Thead>
        <TableCaption>
          <Button onClick={vote} disabled={invalidVotesLeft}>
            Vote
          </Button>
        </TableCaption>
        {candidates}
        {editNoteModal}
      </Table>
    </Box>
  );
};
