import { Flex } from "@chakra-ui/layout";
import React from "react";

function Circle({ text }) {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      backgroundColor="none"
      rounded="full"
      textColor="purple.500"
      w="36px"
      h="36px"
      borderWidth="1px"
      borderColor="purple.500"
    >
      {text}
    </Flex>
  );
}

export default Circle;
