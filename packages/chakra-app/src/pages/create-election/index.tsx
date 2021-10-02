import { TileDocument } from "@ceramicnetwork/stream-tile";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import {
  Button,
  Divider,
  Box,
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
} from "@chakra-ui/react";
import NextLink from "next/link";
import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { FiX } from "react-icons/fi";
import { useMoralis } from "react-moralis";
import QRCodeIcon from "../../components/Icons/QRCodeIcon";
import { ControllerPlus } from "../../components/Inputs/ControllerPlus";
import CenteredFrame from "../../components/layout/CenteredFrame";
import { makeCeramicClient } from "../../utils";
import { useRouter } from "next/router";

const CreateElectionPage: React.FunctionComponent = () => {
  const router = useRouter();
  function goBack() {
    router.back();
  }

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting },
  } = useForm();
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control, // control props comes from useForm (optional: if you are using FormContext)
      name: "candidates", // unique name for your Field Array
      // keyName: "id", default to "id", you can change the key name
    }
  );
  useEffect(() => {
    append("");
    return () => {
      remove();
    };
  }, [append]);

  const { user } = useMoralis();

  const onSubmit = async (values: Record<string, any>) => {
    if (user?.attributes.ethAddress) {
      const formattedValues = Object.entries(values).reduce(
        (fValues, [currentKey, currentValue]) => {
          if (currentKey === "candidates") {
            fValues[currentKey as "candidates"] = currentValue.map(
              ({ value }: { value: string }) => value
            );
            return fValues;
          }
          if (currentKey === "funding" || currentKey === "voteAllocation") {
            fValues[currentKey] = parseInt(currentValue);
            return fValues;
          }
          fValues[currentKey] = currentValue;
          return fValues;
        },
        {} as Record<string, any>
      );
      console.log(formattedValues);
      const { ceramic, idx, schemasCommitId } = await makeCeramicClient(
        user?.attributes.ethAddress
      );
      const existingElections = await idx.get<any>("elections");
      const previousElections = existingElections
        ? Object.values(existingElections)
        : null;

      if (ceramic?.did?.id) {
        const electionDoc = await TileDocument.create(
          ceramic,
          formattedValues,
          {
            controllers: [ceramic.did.id],
            family: "election",
            schema: schemasCommitId.election,
          }
        );
        // https://developers.ceramic.network/learn/glossary/#anchor-commit
        // https://developers.ceramic.network/learn/glossary/#anchor-service
        const anchorStatus = await electionDoc.requestAnchor();
        electionDoc.makeReadOnly();
        Object.freeze(electionDoc);

        await idx.set("votes", [
          { id: electionDoc.id.toUrl(), name: electionDoc.content.name },
          ...Object.values(previousElections || {}),
        ]);

        const sealedElection = electionDoc.commitId.toUrl();
        console.log({ anchorStatus, sealedElection: sealedElection });
      }
    }
    console.log(values);
    console.log(values.candidates.map(({ value }: { value: string }) => value));
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
          <FormErrorMessage>
            {errors.name && errors.name.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.funding}>
          <FormLabel htmlFor="funding">
            Funding Allocation (amount to be distributed)
          </FormLabel>
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
          <FormErrorMessage>
            {errors.funding && errors.funding.message}
          </FormErrorMessage>
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
          <FormErrorMessage>
            {errors.voteAllocation && errors.voteAllocation.message}
          </FormErrorMessage>
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
                      input: (value: any) => {
                        console.log(value);
                        return value;
                      },
                      output: (e: any) => e.target.value,
                    }}
                    control={control}
                  />
                  <InputRightElement p="2.5" children={<QRCodeIcon />} />
                </InputGroup>
                <Icon
                  _hover={{ cursor: "pointer" }}
                  color="red.500"
                  as={FiX}
                  onClick={() => remove(index)}
                />
              </HStack>
            </HStack>
          ))}
          <FormErrorMessage>
            {errors.voteAllocation && errors.voteAllocation.message}
          </FormErrorMessage>
        </FormControl>

        <Button
          w="100%"
          variant="outline"
          onClick={() => append({ address: "", ens: "" })}
        >
          + Add voter
        </Button>
        <Box pb="1rem"></Box>
        <Divider backgroundColor="purple.500" />
        <Box pt="1rem" align="end">
          <Button
            mt={4}
            colorScheme="teal"
            isLoading={isSubmitting}
            type="submit"
          >
            Submit
          </Button>
        </Box>
      </Stack>
    </CenteredFrame>
  );
};

export default CreateElectionPage;
