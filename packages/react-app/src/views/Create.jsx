import { ChevronLeftIcon } from "@chakra-ui/icons";
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
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  List,
  ListItem,
  ListIcon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
  useColorModeValue,
  Textarea,
  Select,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { fromWei, toWei, toBN } from "web3-utils";
import { useFieldArray, useForm } from "react-hook-form";
import { FiX } from "react-icons/fi";
import { useHistory } from "react-router-dom";
import QRCodeIcon from "../components/Icons/QRCodeIcon";
import { ControllerPlus } from "../components/Inputs/ControllerPlus";
import CenteredFrame from "../components/layout/CenteredFrame";
import dips from "../dips";
import AddressInputChakra from "../components/AddressInputChakra";
import AddressChakra from "../components/AddressChakra";
import { blockExplorer } from "../App";

import { CERAMIC_PREFIX } from "../dips/helpers";

const CURRENCY = "ETH";
const TOKEN = "UNI";
const TOKEN_ADR = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
const DIP_TYPES = Object.keys(dips);

const Create = ({
  address,
  mainnetProvider,
  localProvider,
  mainnetContracts,
  userSigner,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) => {
  /***** Routes *****/
  const routeHistory = useHistory();

  const viewElection = async () => {
    if (electionId) {
      const isCeramicRecord = electionId.startsWith(CERAMIC_PREFIX);
      const id = isCeramicRecord ? electionId.split(CERAMIC_PREFIX)[1] : electionId;
      routeHistory.push("/election/" + id + `?kind=${isCeramicRecord ? "ceramic" : "offChain"}`);
    }
  };

  const createAnotherElection = () => {
    setIsCreatedElection(false);
    setIsConfirmingElection(false);
  };

  /***** States *****/
  const [selectedQdip, setSelectedQdip] = useState("ceramic");
  const [qdipHandler, setQdipHandler] = useState();
  const [errorMsg, setErrorMsg] = useState();
  const [isConfirmingElection, setIsConfirmingElection] = useState(false);
  const [isCreatedElection, setIsCreatedElection] = useState(false);
  const [electionId, setElectionId] = useState();

  const [newElection, setNewElection] = useState({
    name: "",
    tokenSym: "ETH",
    tokenAdr: "0x0000000000000000000000000000000000000000",
    fundAmount: 0.1,
    voteAllocation: 1,
    kind: "ceramic",
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
    if (readContracts && writeContracts) {
      if (readContracts.Diplomat) {
        init();
      }
    }
  }, [writeContracts, readContracts, address]);

  useEffect(async () => {
    if (qdipHandler) {
    }
  }, [qdipHandler]);

  useEffect(() => {
    // console.log(selectedQdip);
    setQdipHandler(dips[selectedQdip].handler(tx, readContracts, writeContracts, mainnetProvider, address, userSigner));
  }, [selectedQdip]);

  useEffect(() => {
    append("");
    return () => {
      remove();
    };
  }, [append]);
  /***** Methods *****/
  const goBack = () => {
    routeHistory.push("/mockhome");
  };

  const init = async () => {
    setQdipHandler(dips[selectedQdip].handler(tx, readContracts, writeContracts, mainnetProvider, address, userSigner));
  };

  const onSubmit = async values => {
    if (newElection.candidates.length == 0) {
      setErrorMsg("Need to add atleast 1 ENS/address");
      return;
    }
    setIsConfirmingElection(true);
    // Create a new election
    console.log({ newElection });
    newElection.fundAmount = toWei(Number(newElection.fundAmount).toFixed(18).toString());
    newElection.voteAllocation = parseInt(newElection.voteAllocation);

    let result = await qdipHandler.createElection(newElection, selectedQdip);
    if (result.code) {
      setIsConfirmingElection(false);
    } else {
      setIsConfirmingElection(false);
      setIsCreatedElection(true);
      setElectionId(result);
      setNewElection({
        name: "",
        tokenSym: "ETH",
        fundAmount: 0.1,
        voteAllocation: 1,
        tokenAdr: "0x0000000000000000000000000000000000000000",
        kind: "ceramic",
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

  const updateSelectedQdip = e => {
    console.log("updated qdip handler ", e.target.value);
    setNewElection(prevState => ({
      ...prevState,
      kind: e.target.value,
    }));
    setQdipHandler(
      dips[e.target.value].handler(tx, readContracts, writeContracts, mainnetProvider, address, userSigner),
    );
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
    console.log(e.target.value);
    setNewElection(prevState => ({
      ...prevState,
      voteAllocation: e.target.value,
    }));
  };

  const removeCandidate = cand => {
    const newList = newElection.candidates.filter(item => item !== cand);
    setNewElection(prevState => ({
      ...prevState,
      candidates: newList,
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
      if (!newElection.candidates.includes(toAddress)) {
        newElection.candidates.push(toAddress);
      }
    }

    setToAddress("");
  };

  return (
    <CenteredFrame>
      <HStack w="80vw" justifyContent="space-between">
        <Flex flexDirection="column" justifyContent="space-between" alignItems="center" w="full">
          <Flex justifyContent="space-between" alignItems="center" w="full">
            <Text onClick={goBack} _hover={{ cursor: "pointer" }} pb="1rem">
              <ChevronLeftIcon />
              Back
            </Text>
            <Heading py="15" fontSize="1.5rem" color={headingColor}>
              Configure Election
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

              {/* <FormControl py="4">
              <FormLabel htmlFor="description">Election description</FormLabel>
              <Textarea
                placeholder="Election description"
                borderColor="purple.500"
                {...register("description", {
                  maxLength: {
                    value: 150,
                    message: "Maximum length should be 150",
                  },
                })}
              />
              <FormErrorMessage>{errors.description && errors.description.message}</FormErrorMessage>
            </FormControl> */}

              <FormControl py="4" isInvalid={errors.fundAmount || errors.funds}>
                <FormLabel htmlFor="fundAmount">Fund Allocation (amount to be distributed)</FormLabel>
                <HStack pb="1rem" justify="space-between">
                  <HStack>
                    <InputGroup w="300px">
                      <NumberInput max={50} min={0.001} defaultValue={newElection.fundAmount}>
                        <NumberInputField
                          placeholder="fundAmount"
                          borderColor="purple.500"
                          {...register("fundAmount", {
                            required: "This is required",
                          })}
                          value={newElection.fundAmount}
                          onChange={updateFundAmount}
                        />
                        {/* <NumberInputStepper>
                        <NumberIncrementStepper onChange={updateFundAmount} />
                        <NumberDecrementStepper onChange={updateFundAmount} />
                      </NumberInputStepper> */}
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
                <NumberInput max={50} min={1} defaultValue={newElection.voteAllocation}>
                  <NumberInputField
                    placeholder="Vote allocation"
                    borderColor="purple.500"
                    {...register("votes", {
                      required: "This is required",
                    })}
                    value={newElection.voteAllocation}
                    onChange={updateVoteAllocation}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{errors.votes && errors.votes.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.kind} py="4">
                <FormLabel htmlFor="kind">Diplomacy Type</FormLabel>
                <Select
                  {...register("kind", {
                    required: "This is required",
                    maxLength: {
                      value: 10,
                      message: "Maximum length should be 10",
                    },
                  })}
                  value={newElection.kind}
                  onChange={updateSelectedQdip}
                >
                  {DIP_TYPES.map(k => (
                    <option key={k} value={k}>
                      {dips[k].name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <Box pb="1rem"></Box>
              <Divider backgroundColor="purple.500" />
              <Box pb="1rem"></Box>
              <FormControl isInvalid={newElection.candidates.length == 0}>
                <FormLabel htmlFor="candidates">Candidates</FormLabel>
                <AddressInputChakra
                  ensProvider={mainnetProvider}
                  placeholder="Enter ENS name"
                  value={toAddress}
                  onChange={setToAddress}
                />
                <FormErrorMessage>{errors.votes && errors.votes.message}</FormErrorMessage>
              </FormControl>

              <Button w="100%" variant="outline" mt={4} onClick={addVoter}>
                + Add voter
              </Button>
              <Box
                borderColor="purple.500"
                borderWidth="1px"
                borderRadius="8px"
                mt={4}
                py="1rem"
                px="2.5rem"
                overflowY="scroll"
                maxH="200px"
              >
                <List spacing={3}>
                  {newElection.candidates.map((addr, idx) => (
                    <HStack key={idx} align="start" w="100%" spacing="24px">
                      <AddressChakra
                        address={addr}
                        ensProvider={mainnetProvider}
                        blockExplorer={blockExplorer}
                      ></AddressChakra>
                      <Button colorScheme="teal" size="sm" onClick={() => removeCandidate(addr)}>
                        X
                      </Button>
                    </HStack>
                  ))}
                </List>
              </Box>
              <Box pb="1rem"></Box>
              <Divider backgroundColor="purple.500" />
              <Box pt="1rem" align="end">
                {!isCreatedElection && (
                  <Button
                    mt={4}
                    colorScheme="teal"
                    isLoading={isSubmitting || isConfirmingElection}
                    loadingText="Submitting"
                    type="submit"
                  >
                    Submit
                  </Button>
                )}
              </Box>
            </form>
          )}
          {isCreatedElection && (
            <HStack justify="center" align="center" w="100%">
              <Button mt={4} colorScheme="teal" onClick={viewElection}>
                View Election
              </Button>
              <Button mt={4} colorScheme="teal" onClick={createAnotherElection}>
                Create another Election
              </Button>
            </HStack>
          )}
        </Flex>
      </HStack>
    </CenteredFrame>
  );
};

export default Create;
