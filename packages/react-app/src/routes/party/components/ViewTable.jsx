import { Box, Center, Table, Thead, Tbody, Tfoot, Tr, Th, Td, Text, Button } from "@chakra-ui/react";
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
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import AddressChakra from "../../../components/AddressChakra";
import Confetti from "react-confetti";
import { useLocation } from "react-router-dom";
import { useScreenDimensions } from "../../../hooks/useScreenDimensions";

export const ViewTable = ({
  partyData,
  mainnetProvider,
  votesData,
  distribution,
  strategy,
  amountToDistribute,
  address,
}) => {
  const [castVotes, setCastVotes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [candidateNote, setCandidateNote] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef();
  const finalRef = React.useRef();

  const [showConfetti, setShowConfetti] = useState(false);
  const location = useLocation();
  const { width, height } = useScreenDimensions();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const showConfetti = queryParams.get("confetti");
    if (showConfetti) {
      setShowConfetti(true);
    }
  }, [location]);

  useEffect(() => {
    let confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 10000); // Hide the confetti after 10 seconds
    return () => clearTimeout(confettiTimer);
  }, [showConfetti]);

  const candidateRows = useMemo(() => {
    const ballotVotes = votesData && votesData[0] && JSON.parse(votesData[0].data.ballot.votes);
    const dist =
      distribution && distribution.reduce((obj, item) => Object.assign(obj, { [item.address]: item.score }), {});
    const row =
      partyData &&
      partyData.candidates &&
      partyData.candidates.map(d => {
        return (
          <Tbody key={`view-row-${d}`}>
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
                <Center>{ballotVotes && ballotVotes[d]}</Center>
              </Td>
              <Td>
                <Center>{!isNaN(dist[d] * 1) && dist && (dist[d] * 100).toFixed(2)}%</Center>
              </Td>
              {amountToDistribute ? (
                <Td>
                  <Center>{(dist[d] * amountToDistribute).toFixed(2)}</Center>
                </Td>
              ) : null}
            </Tr>
          </Tbody>
        );
      });

    setCastVotes(ballotVotes);
    return row;
  }, [partyData, votesData, distribution, strategy, amountToDistribute]);

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

  const editNoteModal = (
    <Modal initialFocusRef={initialRef} finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create a Note</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl>
            <Input
              onChange={e => setCandidateNote(e.target.value)}
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
      {showConfetti && <Confetti height={height} width={width} />}
      <Table borderWidth="1px">
        <Thead>
          <Tr>
            <Th>
              <Center>Address</Center>
            </Th>
            <Th>
              <Center>Note</Center>
            </Th>
            <Th>
              <Center>{castVotes ? "Your Ballot" : ""}</Center>
            </Th>
            <Th>
              <Center>{`Score (${strategy})`}</Center>
            </Th>
            {amountToDistribute ? (
              <Th>
                <Center>{"Payout"}</Center>
              </Th>
            ) : null}
          </Tr>
        </Thead>
        {candidateRows}
        {editNoteModal}
        <Tfoot></Tfoot>
      </Table>
    </Box>
  );
};
