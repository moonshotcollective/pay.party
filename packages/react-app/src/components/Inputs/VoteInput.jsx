import React from "react";
import { HStack, Button, Input, useNumberInput } from "@chakra-ui/react";

function VoteInput({ addVote, minusVote }) {
  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } = useNumberInput({
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
      <Button onClick={addVote}>-</Button>
      <Input textAlign="center" w="70px" {...input} />
      <Button onClick={minusVote}>+</Button>
    </HStack>
  );
}

export default VoteInput;
