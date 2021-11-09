import { ChevronLeftIcon, CopyIcon, AddIcon, DeleteIcon, CheckIcon } from "@chakra-ui/icons";
import { MdContentPaste } from "react-icons/md";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Flex,
  Heading,
  HStack,
  Input,
  InputGroup,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Center,
  TableCaption,
  Tooltip,
  NumberInput,
  NumberInputField,
  Text,
  useColorModeValue,
  Textarea,
  Select,
  Spinner,
  IconButton,
  Checkbox,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { toWei } from "web3-utils";
import { useFieldArray, useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import CenteredFrame from "../components/layout/CenteredFrame";
import dips from "../dips";
import AddressInputChakra from "../components/AddressInputChakra";
import AddressChakra from "../components/AddressChakra";
import ElectionCard from "../components/Cards/ElectionCard";
import { blockExplorer } from "../App";
import { ethers } from "ethers";

import { CERAMIC_PREFIX } from "../dips/helpers";

const CURRENCY = "ETH";
const TOKEN = process.env.REACT_APP_TOKEN_SYMBOL;
const TOKEN_ADR = process.env.REACT_APP_TOKEN_ADDRESS;

const Create = ({ address, mainnetProvider, userSigner, tx, readContracts, writeContracts, targetNetwork }) => {
  /***** Routes *****/
  const routeHistory = useHistory();

  /***** States *****/
  const [selectedQdip, setSelectedQdip] = useState("ceramic");
  const [qdipHandler, setQdipHandler] = useState();
  const [errorMsg, setErrorMsg] = useState();
  const [isConfirmingElection, setIsConfirmingElection] = useState(false);
  const [isCreatedElection, setIsCreatedElection] = useState(false);
  const [electionId, setElectionId] = useState();
  const [title, setTitle] = useState("Configure Election");
  const [createdElection, setCreatedElection] = useState({});

  const [newElection, setNewElection] = useState({
    name: "",
    description: "",
    tokenSym: "ETH",
    tokenAdr: "0x0000000000000000000000000000000000000000",
    fundAmount: 0.1,
    fundAmountInWei: toWei("0.1"),
    voteAllocation: 1,
    kind: "ceramic",
    voters: [],
    candidates: [],
  });

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting },
  } = useForm();
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: "candidates", // unique name for your Field Array
    // keyName: "id", default to "id", you can change the key name
  });

  /***** Effects *****/

  useEffect(() => {
    if (readContracts) {
      if (readContracts.Diplomat && targetNetwork) {
        return init();
      }
    }
  }, [readContracts, targetNetwork]);

  useEffect(async () => {
    if (qdipHandler) {
    }
  }, [qdipHandler]);

  useEffect(() => {
    // console.log(selectedQdip);
    setQdipHandler(
      dips[selectedQdip].handler(
        tx,
        readContracts,
        writeContracts,
        mainnetProvider,
        address,
        userSigner,
        targetNetwork,
      ),
    );
  }, [selectedQdip, targetNetwork]);

  useEffect(() => {
    append("");
    return () => {
      remove();
    };
  }, [append]);
  /***** Methods *****/
  const goBack = () => {
    routeHistory.push("/");
  };

  const init = () => {
    setQdipHandler(
      dips[selectedQdip].handler(
        tx,
        readContracts,
        writeContracts,
        mainnetProvider,
        address,
        userSigner,
        targetNetwork,
      ),
    );
  };

  const onSubmit = async values => {
    if (newElection.voters.length == 0) {
      setErrorMsg("Need to add at least 1 ENS/address");
      return;
    }
    if (newElection.candidates.length == 0) {
      setErrorMsg("Need to add at least 1 ENS/address candidate");
      return;
    }
    setIsConfirmingElection(true);
    // Create a new election
    // console.log({ newElection });
    // NOTE: Avoid Weird rounding!
    newElection.fundAmountInWei = toWei(newElection.fundAmount.toString());
    newElection.voteAllocation = parseInt(newElection.voteAllocation);

    let result = await qdipHandler.createElection(newElection, selectedQdip);
    if (result.code) {
      setIsConfirmingElection(false);
    } else {
      setIsConfirmingElection(false);
      setIsCreatedElection(true);
      setElectionId(result);
      const electionState = await qdipHandler.getElectionStateById(result);
      setCreatedElection(electionState);
      // console.log({ electionState });
      setTitle("Election Created!");
      setNewElection({
        name: "",
        description: "",
        tokenSym: "ETH",
        fundAmount: 0.1,
        fundAmountInWei: toWei("0.1"),
        voteAllocation: 1,
        tokenAdr: "0x0000000000000000000000000000000000000000",
        kind: "ceramic",
        votes: [],
        candidates: [],
      });
    }
  };
  const updateName = e => {
    setNewElection(prevState => ({
      ...prevState,
      name: e.target.value,
    }));
  };

  const updateDesc = e => {
    setNewElection(prevState => ({
      ...prevState,
      description: e.target.value,
    }));
  };

  const updateCandidates = (checked, addr) => {
    if (checked) {
      setNewElection(prevState => ({
        ...prevState,
        candidates: [...prevState.candidates, addr],
      }));
    } else {
      setNewElection(prevState => ({
        ...prevState,
        candidates: newElection.candidates.filter(d => d !== addr),
      }));
    }
    // console.log(newElection);
  };

  const updateSelectedToken = e => {
    console.log("updated token ", e.target.value);
    setNewElection(prevState => ({
      ...prevState,
      tokenSym: e.target.value,
    }));
    if (e.target.value === TOKEN) {
      setNewElection(prevState => ({
        ...prevState,
        tokenAdr: TOKEN_ADR,
      }));
    }
  };

  const updateFundAmount = e => {
    setNewElection(prevState => ({
      ...prevState,
      fundAmount: e.target.value,
    }));
  };

  const updateVoteAllocation = e => {
    // console.log(e.target.value);
    setNewElection(prevState => ({
      ...prevState,
      voteAllocation: e.target.value,
    }));
  };

  const removeVoter = cand => {
    const newList = newElection.voters.filter(item => item !== cand);
    setNewElection(prevState => ({
      ...prevState,
      voters: newList,
    }));
  };

  const [toAddress, setToAddress] = useState("");
  const addVoter = async () => {
    if (toAddress == "") return;
    if (toAddress.indexOf(".eth") > 0 || toAddress.indexOf(".xyz") > 0) {
      try {
        const possibleAddress = await ensProvider.resolveName(toAddress);
        if (possibleAddress) {
          toAddress = possibleAddress;
        }
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }
    if (toAddress.length != 42 || !toAddress.startsWith("0x")) {
      setToAddress("");
    } else {
      if (!newElection.voters.includes(toAddress)) {
        newElection.voters.push(toAddress);
      }
    }

    setToAddress("");
  };

  const handleAddVoters = async () => {
    const text = await navigator.clipboard.readText();
    const addresses = text.split(",");

    addresses.forEach(voteAddress => {
      try {
        // console.log(voteAddress);
        const voteAddressWithChecksum = ethers.utils.getAddress(voteAddress);
        if (!newElection.voters.includes(voteAddressWithChecksum)) {
          newElection.voters.push(voteAddressWithChecksum);
        }
      } catch (error) {
        console.log(error);
      }
    });
    setToAddress(" ");
    setToAddress("");
  };

  const addCandidates = async () => {
    if (!newElection.candidates.includes(toAddress)) {
      newElection.candidates.push(toAddress);
    }
  };

  return (
    <CenteredFrame>
      <HStack w="40vw" justifyContent="space-between">
        <Flex flexDirection="column" justifyContent="space-between" alignItems="center" w="full">
          <Flex justifyContent="space-between" alignItems="center" w="full">
            <Text onClick={goBack} _hover={{ cursor: "pointer" }} pb="1rem">
              <ChevronLeftIcon />
              Back
            </Text>
            <Heading py="15" fontSize="1.5rem" color={headingColor}>
              {title}
            </Heading>
            <div></div>
          </Flex>
          {!isCreatedElection && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormControl isInvalid={errors.elec_name} id="elec_name">
                <FormLabel htmlFor="elec_name">Election name</FormLabel>
                <Input
                  placeholder="Election name"
                  borderColor="purple.500"
                  value={newElection.name}
                  {...register("elec_name", {
                    required: "This is required",
                    maxLength: {
                      value: 150,
                      message: "Maximum length should be 150",
                    },
                  })}
                  autoComplete="off"
                  onChange={updateName}
                />
                <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
              </FormControl>

              <FormControl py="4">
                <FormLabel htmlFor="description">Election description</FormLabel>
                <Textarea
                  placeholder="Election description"
                  borderColor="purple.500"
                  value={newElection.description}
                  {...register("description", {
                    maxLength: {
                      value: 150,
                      message: "Maximum length should be 150",
                    },
                  })}
                  autoComplete="off"
                  onChange={updateDesc}
                />
                <FormErrorMessage>{errors.description && errors.description.message}</FormErrorMessage>
              </FormControl>

              <FormControl py="4" isInvalid={errors.fundAmount || errors.funds}>
                <FormLabel htmlFor="fundAmount">Fund Allocation (amount to be distributed)</FormLabel>
                <HStack pb="1rem" justify="space-between">
                  <HStack>
                    <InputGroup w="300px">
                      <NumberInput max={50} min={0.001} defaultValue={newElection.fundAmount}>
                        <NumberInputField
                          w="300px"
                          placeholder="fundAmount"
                          borderColor="purple.500"
                          {...register("fundAmount", {
                            required: "This is required",
                          })}
                          value={newElection.fundAmount}
                          onChange={updateFundAmount}
                        />
                      </NumberInput>
                    </InputGroup>
                    <Select
                      {...register("funds", {
                        required: "This is required",
                        maxLength: {
                          value: 10,
                          message: "Maximum length should be 10",
                        },
                      })}
                      value={newElection.tokenSym}
                      onChange={updateSelectedToken}
                      w="200px"
                    >
                      <option value={CURRENCY}>{CURRENCY}</option>
                      <option value={TOKEN}>{TOKEN}</option>
                    </Select>
                  </HStack>
                </HStack>
                <FormErrorMessage>
                  {(errors.fundAmount && errors.fundAmount.message) || (errors.funds && errors.funds.message)}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.votes}>
                <FormLabel htmlFor="votes">
                  Vote Allocation (number of votes for each voter)
                  <br />
                </FormLabel>
                <NumberInput max={1000} min={1} defaultValue={newElection.voteAllocation}>
                  <NumberInputField
                    placeholder="Vote allocation"
                    borderColor="purple.500"
                    {...register("votes", {
                      required: "This is required",
                    })}
                    value={newElection.voteAllocation}
                    onChange={updateVoteAllocation}
                  />
                </NumberInput>
                <FormErrorMessage>{errors.votes && errors.votes.message}</FormErrorMessage>
              </FormControl>

              <Box pb="1rem"></Box>
              <Divider backgroundColor="purple.500" />
              <Box pb="1rem"></Box>
              <FormControl isInvalid={newElection.voters.length == 0}>
                <FormLabel htmlFor="voters">Add Participants</FormLabel>
                <FormErrorMessage>{errors.votes && errors.votes.message}</FormErrorMessage>
              </FormControl>
              <HStack>
                <AddressInputChakra
                  ensProvider={mainnetProvider}
                  placeholder="Enter ENS name"
                  value={toAddress}
                  onChange={setToAddress}
                />
                <InputGroup>
                  <Tooltip label="Add Participant">
                    <IconButton aria-label="Add address" icon={<AddIcon />} onClick={addVoter} variant="ghost" />
                  </Tooltip>
                  // Sniff browser -- TODO: add firefox support
                  {navigator.userAgent.indexOf("Firefox") < 0 && (
                    <Tooltip label="Paste from clipboard">
                      <IconButton
                        aria-label="Paste from clipboard"
                        icon={<MdContentPaste />}
                        onClick={() => handleAddVoters()}
                        variant="ghost"
                      />
                    </Tooltip>
                  )}
                </InputGroup>
              </HStack>
              <Box
                borderColor="purple.500"
                borderWidth="1px"
                borderRadius="8px"
                mt={4}
                py="0rem"
                px="0rem"
                overflowY="scroll"
                maxH="200px"
              >
                <Table variant="simple" size="md">
                  <TableCaption>:)</TableCaption>
                  <Thead>
                    <Tr>
                      <Tooltip
                        label="A candidate will be the participant who is being voted on."
                        aria-label="A tooltip"
                      >
                        <Th>Candidate</Th>
                      </Tooltip>
                      <Tooltip label="A participant is who can vote in this election." aria-label="A tooltip">
                        <Th>Participant</Th>
                      </Tooltip>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {newElection.voters.map((addr, idx) => (
                      <Tr key={idx}>
                        <Td w="0%">
                          <Center w="70px" color="white">
                            <Checkbox
                              onChange={e => {
                                // console.log(e.target.checked, addr);
                                updateCandidates(e.target.checked, addr);
                              }}
                            ></Checkbox>
                          </Center>
                        </Td>
                        <Td w="100%">
                          <AddressChakra
                            address={addr}
                            ensProvider={mainnetProvider}
                            blockExplorer={blockExplorer}
                            fontSize={16}
                          ></AddressChakra>
                        </Td>
                        <Td w="0%">
                          <IconButton
                            aria-label="Remove address"
                            icon={<DeleteIcon />}
                            onClick={() => removeVoter(addr)}
                            variant="ghost"
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              <Box pb="1rem"></Box>
              <Divider backgroundColor="purple.500" />
              <Box pt="1rem" align="end">
                {!isCreatedElection && (
                  <Center>
                    <Button
                      mt={4}
                      mb={4}
                      width="30vw"
                      colorScheme="teal"
                      isLoading={isSubmitting || isConfirmingElection}
                      loadingText="Submitting"
                      type="submit"
                      disabled={newElection.candidates.length === 0}
                      leftIcon={<CheckIcon />}
                    >
                      Submit Election
                    </Button>
                  </Center>
                )}
              </Box>
            </form>
          )}
          {isCreatedElection && !createdElection.id && (
            <CenteredFrame>
              <Flex flexDirection="column" justifyContent="center" alignItems="center">
                <Heading fontSize="1.5rem" color={headingColor}>
                  Creating election...
                </Heading>
                <Spinner color="purple.700" size="xl" />
              </Flex>
            </CenteredFrame>
          )}
          {isCreatedElection && createdElection.id && (
            <HStack justify="center" align="center" w="80%">
              <ElectionCard
                id={createdElection.id}
                name={createdElection.name}
                owner={createdElection.creator}
                voted={`${createdElection.n_voted.n_voted} / ${createdElection.n_voted.outOf}`}
                active={createdElection.active}
                amount={createdElection.amtFromWei}
                tokenSymbol={createdElection.tokenSymbol}
                createdAt={createdElection.created_date}
                mainnetProvider={mainnetProvider}
              />
            </HStack>
          )}
        </Flex>
      </HStack>
    </CenteredFrame>
  );
};

export default Create;
