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
import { useFieldArray, useForm } from "react-hook-form";
import { FiX } from "react-icons/fi";
import { useHistory } from "react-router-dom";
import QRCodeIcon from "../components/Icons/QRCodeIcon";
import { ControllerPlus } from "../components/Inputs/ControllerPlus";
import CenteredFrame from "../components/layout/CenteredFrame";
import dips from "../dips";
import AddressInputChakra from "../components/AddressInputChakra";

import { CERAMIC_PREFIX } from "../dips/helpers";

const CURRENCY = "ETH";
const TOKEN = "UNI";
const DIP_TYPES = Object.keys(dips);

const CreateElectionPage = ({
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
      routeHistory.push("/vote/" + id + `?kind=${isCeramicRecord ? "ceramic" : "offChain"}`);
    }
  };

  /***** States *****/
  const [selectedQdip, setSelectedQdip] = useState("offChain");
  const [qdipHandler, setQdipHandler] = useState();
  const [current, setCurrent] = useState(0);
  const [errorMsg, setErrorMsg] = useState();
  const [isConfirmingElection, setIsConfirmingElection] = useState(false);
  const [isCreatedElection, setIsCreatedElection] = useState(false);
  const [electionId, setElectionId] = useState();

  const [newElection, setNewElection] = useState({
    name: "test",
    funds: "ETH",
    fundAmount: 1,
    votes: 5,
    tokenAdr: "0x0000000000000000000000000000000000000000",
    tokenName: "",
    kind: "offChain",
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
    console.log(selectedQdip);
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
    setIsConfirmingElection(true);
    // Create a new election
    const formattedValues = Object.entries(values).reduce((fValues, [currentKey, currentValue]) => {
      if (currentKey === "candidates") {
        fValues[currentKey] = currentValue.map(({ value }) => value);
        return fValues;
      }
      if (currentKey === "fundAmount" || currentKey === "votes") {
        fValues[currentKey] = parseInt(currentValue);
        return fValues;
      }
      if (currentKey === "funds") {
        // TODO: handle other tokens & display election kind
        if (currentValue === "ETH") {
          fValues.tokenAdr = "0x0000000000000000000000000000000000000000";
          return fValues;
        }
      }
      fValues[currentKey] = currentValue;
      return fValues;
    }, {});
    console.log(formattedValues);
    let id = await qdipHandler.createElection(newElection, selectedQdip);
    console.log(id);
    if (id) {
      setIsConfirmingElection(false);
      setIsCreatedElection(true);
      setElectionId(id);
    }
  };
  const updateSelectedQdip = qdip => {
    newElection.kind = qdip;
    setQdipHandler(dips[qdip].handler(tx, readContracts, writeContracts, mainnetProvider, address, userSigner));
  };

  const [toAddress, setToAddress] = useState("");

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
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl isInvalid={errors.name}>
              <FormLabel htmlFor="name">Election name</FormLabel>
              <Input
                placeholder="Election name"
                borderColor="purple.500"
                defaultValue={newElection.name}
                {...register("name", {
                  required: "This is required",
                  maxLength: {
                    value: 150,
                    message: "Maximum length should be 150",
                  },
                })}
              />
              <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
            </FormControl>

            <FormControl py="4">
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
            </FormControl>

            <FormControl isInvalid={errors.fundAmount || errors.funds}>
              <FormLabel htmlFor="fundAmount">fundAmount Allocation (amount to be distributed)</FormLabel>
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
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </InputGroup>
                  <Select
                    defaultValue={CURRENCY}
                    {...register("funds", {
                      required: "This is required",
                      maxLength: {
                        value: 10,
                        message: "Maximum length should be 10",
                      },
                    })}
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
              <NumberInput max={50} min={1} defaultValue={newElection.votes}>
                <NumberInputField
                  placeholder="Vote allocation"
                  borderColor="purple.500"
                  {...register("votes", {
                    required: "This is required",
                  })}
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
                defaultValue="Firebase (Centralized)"
                {...register("kind", {
                  required: "This is required",
                  maxLength: {
                    value: 10,
                    message: "Maximum length should be 10",
                  },
                })}
                onSelect={updateSelectedQdip}
              >
                {DIP_TYPES.map(k => (
                  <option key={k} value={k}>
                    {dips[k].name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isInvalid={errors.candidates}>
              <FormLabel htmlFor="candidates">Candidates</FormLabel>
              {fields.map((field, index) => (
                <HStack pb="1rem" justify="space-between" key={index}>
                  <Text>Voter {index + 1}</Text>
                  <HStack>
                    <AddressInputChakra
                      ensProvider={mainnetProvider}
                      placeholder="Enter ENS name"
                      value={toAddress}
                      field={field}
                      index={index}
                    />

                    {/* <InputGroup w="300px">
                      <ControllerPlus
                        key={field.id} // important to include key with field's id
                        {...register(`candidates.${index}.value`)}
                        transform={{
                          input: value => {
                            return value;
                          },
                          output: e => e.target.value,
                        }}
                        control={control}
                      />
                      <InputRightElement p="2.5" children={<QRCodeIcon />} />
                    </InputGroup>
                    <Icon _hover={{ cursor: "pointer" }} color="red.500" as={FiX} onClick={() => remove(index)} /> */}
                  </HStack>
                </HStack>
              ))}
              <FormErrorMessage>{errors.votes && errors.votes.message}</FormErrorMessage>
            </FormControl>

            <Button w="100%" variant="outline" onClick={() => append({ address: "", ens: "" })}>
              + Add voter
            </Button>
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
              {isCreatedElection && (
                <Button mt={4} colorScheme="teal" onClick={viewElection}>
                  View Election
                </Button>
              )}
            </Box>
          </form>
        </Flex>
      </HStack>
    </CenteredFrame>
  );
};

export default CreateElectionPage;
