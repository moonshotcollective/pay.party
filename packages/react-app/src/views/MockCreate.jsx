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
import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { FiX } from "react-icons/fi";
import { useHistory } from "react-router-dom";
import QRCodeIcon from "../components/Icons/QRCodeIcon";
import { ControllerPlus } from "../components/Inputs/ControllerPlus";
import CenteredFrame from "../components/layout/CenteredFrame";

const CreateElectionPage = () => {
  const routeHistory = useHistory();
  const goBack = () => {
    routeHistory.push("/mockhome");
  };

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
  useEffect(() => {
    append("");
    return () => {
      remove();
    };
  }, [append]);

  const onSubmit = async values => {};
  return (
    <CenteredFrame>
      <Text onClick={goBack} _hover={{ cursor: "pointer" }} pb="1rem">
        <ChevronLeftIcon />
        Back
      </Text>
      <Heading py="15" fontSize="1.5rem" color={headingColor}>
        Configure Election
      </Heading>
      <Stack as="form" onSubmit={handleSubmit(onSubmit)}>
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
          <FormLabel htmlFor="name">Election description</FormLabel>
          <Textarea
            placeholder="Election description"
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
          <FormLabel htmlFor="name">Funding</FormLabel>
          <HStack pb="1rem" justify="space-between">
            <Text>Total funds to be distributed</Text>
            <HStack>
              <InputGroup w="300px">
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
              </InputGroup>
              <Select placeholder="Select">
                <option value="option1">ETH</option>
                <option value="option2">UNI</option>
                <option value="option3">BTC</option>
              </Select>
            </HStack>
          </HStack>
          <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.funding}>
          <FormLabel htmlFor="funding">Funding Allocation (amount to be distributed)</FormLabel>
          <NumberInput max={50} min={0.001}>
            <NumberInputField
              placeholder="funding"
              borderColor="purple.500"
              {...register("funding", {
                required: "This is required",
              })}
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormErrorMessage>{errors.funding && errors.funding.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.voteAllocation}>
          <FormLabel htmlFor="voteAllocation">
            Vote Allocation (number of votes for each voter)
            <br />
          </FormLabel>
          <NumberInput max={50} min={1}>
            <NumberInputField
              placeholder="Vote allocation"
              borderColor="purple.500"
              {...register("voteAllocation", {
                required: "This is required",
              })}
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormErrorMessage>{errors.voteAllocation && errors.voteAllocation.message}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="name">Diplomacy Type</FormLabel>
          <Select>
            <option value="option1">Off-chain</option>
            <option value="option2">On-chain (votes & election)</option>
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
          <FormErrorMessage>{errors.voteAllocation && errors.voteAllocation.message}</FormErrorMessage>
        </FormControl>

        <Button w="100%" variant="outline" onClick={() => append({ address: "", ens: "" })}>
          + Add voter
        </Button>
        <Box pb="1rem"></Box>
        <Divider backgroundColor="purple.500" />
        <Box pt="1rem" align="end">
          <Button mt={4} colorScheme="teal" isLoading={isSubmitting} type="submit">
            Submit
          </Button>
        </Box>
      </Stack>
    </CenteredFrame>
  );
};

export default CreateElectionPage;
