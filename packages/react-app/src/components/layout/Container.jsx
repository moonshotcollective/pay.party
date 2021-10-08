import { VStack } from "@chakra-ui/react";
import React from "react";

const Container = props => {
  return (
    <VStack px="16" w="full" minH={{ sm: "400px", md: "600px" }}>
      {props.children}
    </VStack>
  );
};

export default Container;
