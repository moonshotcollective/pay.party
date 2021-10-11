import React from "react";
import { HStack, Button, Heading, Input, useNumberInput } from "@chakra-ui/react";

function VoteInput({ addVote, minusVote, votes }) {
  return (
    <HStack>
      <Button onClick={minusVote}>-</Button>
      {/* <Input textAlign="center" w="70px" {...votes} /> */}
      <Heading fontSize="1.5rem" color="violet.50">
        {votes}
      </Heading>
      <Button onClick={addVote}>+</Button>
    </HStack>
  );
}

export default VoteInput;
