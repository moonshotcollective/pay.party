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
} from '@chakra-ui/react';
import { EditIcon, CheckIcon } from "@chakra-ui/icons";
import React, { useState, useMemo, useRef } from "react";
import AddressChakra from "../../../components/AddressChakra";

export const ViewTable = ({ partyData, mainnetProvider, votesData, distribution, strategy, amountToDistribute, address }) => {
  const [castVotes, setCastVotes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef()
  const finalRef = React.useRef()

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
              <Center>
              <Text>This is a test note</Text>
              </Center>
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

  const editNoteModal = (
      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update your Note</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Input ref={initialRef} placeholder='Enter your note here' />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3}>
              Submit
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );

  return (
    <Box>
      <Table borderWidth="1px">
        <Thead>
          <Tr>
            <Th>
              <Center>Address</Center>
            </Th>
            <Th>
              <Center>
                Note
              <Button
              size="xs"
              rightIcon={<EditIcon />}
              variant="ghost"
              ml="1"
              onClick={onOpen}
              >
              </Button>
              </Center>
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
