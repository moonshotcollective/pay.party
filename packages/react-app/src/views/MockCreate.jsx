import { ChevronLeftIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
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
import { handlers } from "../dips";

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
    let index = await readContracts.Diplomat.electionCount();
    routeHistory.push("/vote/" + (index.toNumber() - 1));
  };

  /***** States *****/
  const [selectedQdip, setSelectedQdip] = useState("onChain");
  const [qdipHandler, setQdipHandler] = useState();
  const [current, setCurrent] = useState(0);
  const [errorMsg, setErrorMsg] = useState();
  const [isConfirmingElection, setIsConfirmingElection] = useState(false);
  const [isCreatedElection, setIsCreatedElection] = useState(false);

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
    setQdipHandler(
      handlers[selectedQdip].handler(tx, readContracts, writeContracts, mainnetProvider, address, userSigner),
    );
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
    setQdipHandler(
      handlers[selectedQdip].handler(tx, readContracts, writeContracts, mainnetProvider, address, userSigner),
    );
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
    return qdipHandler
      .createElection(formattedValues, selectedQdip)
      .then(success => {
        console.log({ success });
        setIsConfirmingElection(false);
        setIsCreatedElection(true);
      })
      .catch(err => {
        console.log(err);
        setIsConfirmingElection(false);
      });
  };
  return (
    <CenteredFrame>
      <Text onClick={goBack} _hover={{ cursor: "pointer" }} pb="1rem">
        <ChevronLeftIcon />
        Back
      </Text>
      <Heading py="15" fontSize="1.5rem" color={headingColor}>
        Configure Election
      </Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl isInvalid={errors.name}>
          <FormLabel htmlFor="name">Election name</FormLabel>
          <Input
            placeholder="Election name"
            borderColor="purple.500"
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

        <FormControl>
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
                <NumberInput max={50} min={0.001}>
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
                defaultValue="ETH"
                {...register("funds", {
                  required: "This is required",
                  maxLength: {
                    value: 10,
                    message: "Maximum length should be 10",
                  },
                })}
              >
                <option value="ETH">ETH</option>
                <option value="UNI">UNI</option>
                <option value="BTC">BTC</option>
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
          <NumberInput max={50} min={1}>
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

        <FormControl isInvalid={errors.kind}>
          <FormLabel htmlFor="kind">Diplomacy Type</FormLabel>
          <Select
            defaultValue="onChain"
            {...register("kind", {
              required: "This is required",
              maxLength: {
                value: 10,
                message: "Maximum length should be 10",
              },
              onChange: e => {
                setSelectedQdip(e.target.value);
              },
            })}
          >
            <option value="offChain">Off-chain</option>
            <option value="onChain">On-chain (votes & election)</option>
          </Select>
        </FormControl>

        <FormControl isInvalid={errors.candidates}>
          <FormLabel htmlFor="candidates">Candidates</FormLabel>
          {fields.map((field, index) => (
            <HStack pb="1rem" justify="space-between">
              <Text>Voter {index + 1}</Text>
              <HStack>
                <InputGroup w="300px">
                  <ControllerPlus
                    key={field.id} // important to include key with field's id
                    {...register(`candidates.${index}.value`)}
                    transform={{
                      input: value => {
                        console.log(value);
                        return value;
                      },
                      output: e => e.target.value,
                    }}
                    control={control}
                  />
                  <InputRightElement p="2.5" children={<QRCodeIcon />} />
                </InputGroup>
                <Icon _hover={{ cursor: "pointer" }} color="red.500" as={FiX} onClick={() => remove(index)} />
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
          <Button
            mt={4}
            colorScheme="teal"
            isLoading={isSubmitting || isConfirmingElection}
            loadingText="Submitting"
            type="submit"
          >
            Submit
          </Button>
        </Box>
      </form>
    </CenteredFrame>
  );
};

export default CreateElectionPage;
