import React from "react";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Divider,
  Button,
  Checkbox,
  Input,
  Avatar,
  useNumberInput,
} from "@chakra-ui/react";

function VoteInput() {
  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } =
    useNumberInput({
      step: 1,
      defaultValue: 0,
      min: 0,
      max: 6,
      precision: 0,
    });

  const inc = getIncrementButtonProps();
  const dec = getDecrementButtonProps();
  const input = getInputProps({ readOnly: true });

  return (
    <HStack>
      <Button {...dec}>-</Button>
      <Input {...input} />
      <Button {...inc}>+</Button>
    </HStack>
  );
}

export default VoteInput;
