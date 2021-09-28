import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useMoralis } from "react-moralis";
import { makeCeramicClient } from "../../utils";

const CreateElectionPage: React.FunctionComponent = () => {
  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting },
  } = useForm();
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
    console.log(values);
    console.log(values.candidates.map(({ value }: { value: string }) => value));
  };
  return (
    <Stack>
      <Heading>Create Election</Heading>
      <Stack as="form" onSubmit={handleSubmit(onSubmit)}>
        <FormControl isInvalid={errors.name}>
          <FormLabel htmlFor="name">Name</FormLabel>
          <Input
            placeholder="Election name"
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
          <FormLabel htmlFor="funding">Funding Allocation</FormLabel>
          <NumberInput max={50} min={0.001}>
            <NumberInputField
              placeholder="funding"
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
          <FormLabel htmlFor="voteAllocation">Vote Allocation</FormLabel>
          <Input
            type="number"
            placeholder="Vote Allocation"
            {...register("voteAllocation", {
              required: "This is required",
            })}
          />
          <FormErrorMessage>
            {errors.voteAllocation && errors.voteAllocation.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.candidates}>
          <FormLabel htmlFor="candidates">Candidates</FormLabel>
          {fields.map((field, index) => (
            <HStack>
              <Input
                key={field.id} // important to include key with field's id
                {...register(`candidates.${index}.value`)}
              />
              <AddIcon onClick={() => append("")} />
            </HStack>
          ))}
          <FormErrorMessage>
            {errors.voteAllocation && errors.voteAllocation.message}
          </FormErrorMessage>
        </FormControl>

        <Button
          mt={4}
          colorScheme="teal"
          isLoading={isSubmitting}
          type="submit"
        >
          Create
        </Button>
      </Stack>
    </Stack>
  );
};

export default CreateElectionPage;
