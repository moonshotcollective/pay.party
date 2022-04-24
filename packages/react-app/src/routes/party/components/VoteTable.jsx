import {
  Box,
  Button,
  Text,
  Textarea,
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
import { EditIcon, CheckIcon, WarningTwoIcon } from "@chakra-ui/icons";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import AddressChakra from "../../../components/AddressChakra";
import { ethers } from "ethers";
import { NETWORK } from "../../../constants";

export const VoteTable = ({
  partyData,
  setPartyData,
  address,
  userSigner,
  targetNetwork,
  readContracts,
  mainnetProvider,
  onboard,
}) => {
  // Init votes data to 0 votes for each candidate
  const [votesData, setVotesData] = useState(null);
  // Init votes left to nvotes
  const [votesLeft, setVotesLeft] = useState(null);
  const [candidateNote, setCandidateNote] = useState("");
  const [noteChars, setNoteChars] = useState(0);
  const [noteIsLoading, setNoteIsLoading] = useState(false);
  const [invalidVotesLeft, setInvalidVotesLeft] = useState(false);
  const [blockNumber, setBlockNumber] = useState("-1");
  const [isCorrectChainId, setIsCorrectChainId] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef();
  const finalRef = React.useRef();
  mainnetProvider.on("block", bn => {
    setBlockNumber(bn.toString());
  });
  const history = useHistory();
  let { id } = useParams();

  useEffect(
    _ => {
      try {
        let spent = 0;

        if (!noteIsLoading) {
          setVotesData(partyData.candidates.reduce((o, key) => ({ ...o, [key]: 0 }), {}));
        } else {
          spent = Object.values(votesData).reduce((a, b) => a + b);
        }
        setVotesLeft(partyData.config.nvotes - spent);
        setNoteIsLoading(false);
      } catch (error) {
        // Do something?
        console.log(error);
      }
    },
    [partyData, targetNetwork],
  );

  useEffect(
    _ => {
      try {
        let state = onboard.getState();
        setIsCorrectChainId(state.network === partyData.config.chainId);
      } catch (err) {
        console.log(err);
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
    try {
      setNoteIsLoading(true);
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
        Party: [{ name: "note", type: "Note" }],
        Note: [{ name: "message", type: "string" }],
      };
      const message = {
        note: {
          message: candidateNote,
        },
      };
      const sig = await userSigner._signTypedData(domain, types, message);
      const note = {
        candidate: address,
        message: candidateNote,
        signature: sig,
      };
      const noteRes = await fetch(`${process.env.REACT_APP_API_URL}/party/${partyData.id}/note`, {
        method: "put",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });
      const testDataX = await noteRes.json();
      console.log("This is ", testDataX.message);
      // TODO: Find a more efficient approach instead of re-requesting the whole party
      const partyRes = await fetch(`${process.env.REACT_APP_API_URL}/party/${id}`);
      const data = await partyRes.json();
      setPartyData(data);
      // setNoteIsLoading(false);
      onClose();
    } catch {
      console.log("error submitting note");
      setNoteIsLoading(false);
    }
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
              window.open(`/party/${partyData.id}?confetti=true`, "_self");
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

  // function testFunc() {
  //   let c;
  //   c = partyData.candidates.map(
  //     d => {
  //       let varVar = partyData.notes?.filter(n => n.candidate.toLowerCase() === d.toLowerCase()).reverse()[0]?.message;
  //       console.log("Doing test to..",d);
  //       console.log("Doing more test to..",varVar);
  //       return (
  //         <span>{varVar}</span>
  //       );
  //     }
  //   )
  // } 
  // // testFunc();
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
                  <Box width="24em">
                    <Text>
                      {
                        partyData.notes?.filter(n => n.candidate.toLowerCase() === d.toLowerCase()).reverse()[0]
                          ?.message
                      }
                      {/* {testFunc} */}
                    </Text>
                  </Box>
                  {d.toLowerCase() === address.toLowerCase() ? (
                    <Button
                      size="xs"
                      rightIcon={<EditIcon />}
                      variant="link"
                      ml="1"
                      onClick={_ => {
                        setNoteChars(0);
                        onOpen();
                      }}
                    >
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
                    disabled={!isCorrectChainId}
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
            <Textarea
              onChange={e => {
                setCandidateNote(e.target.value);
                setNoteChars(e.target.value.length);
              }}
              ref={initialRef}
              placeholder="Enter your note here"
            />
            <Text>{noteChars}/256</Text>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={newCandidateNote} isLoading={noteIsLoading} isDisabled={noteChars > 256}>
            Submit
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  const handleNetworkSwitch = async () => {  
    const ethereum = window.ethereum;
    const data = [
      {
        chainId: "0x" + targetNetwork.chainId.toString(16),
        chainName: targetNetwork.name,
        nativeCurrency: targetNetwork.nativeCurrency,
        rpcUrls: [targetNetwork.rpcUrl],
        blockExplorerUrls: [targetNetwork.blockExplorer],
      },
    ];

    let switchTx;
    // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
    try {
      switchTx = await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + partyData.config.chainId }],
      });

      // switch app network to party network
      let partyNetworkName = NETWORK(partyData.config.chainId).name;
      window.localStorage.setItem("network", partyNetworkName);

      setTimeout(window.location.reload(), 2000);
    } catch (switchError) {
      // not checking specific error code, because maybe we're not using MetaMask
      try {
        switchTx = await ethereum.request({
          method: "wallet_addEthereumChain",
          params: data,
        });
      } catch (addError) {
        // handle "add" error
      }
    }

    if (switchTx) {
      console.log("Switch Txn: " + switchTx);
    }
  };

  return (
    <Box>
      {!isCorrectChainId ? (
        <Center>
          <Button
            onClick={handleNetworkSwitch}
            leftIcon={<WarningTwoIcon />}
            variant="outline"
          >{`You must switch networks to vote!`}</Button>
        </Center>
      ) : null}
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
          <Button onClick={vote} disabled={invalidVotesLeft || !isCorrectChainId}>
            Vote
          </Button>
        </TableCaption>
        {candidates}
        {editNoteModal}
      </Table>
    </Box>
  );
};
