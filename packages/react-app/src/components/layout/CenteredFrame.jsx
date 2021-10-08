import React from "react";
import { VStack, Box } from "@chakra-ui/react";

const CenteredFrame = props => {
  return (
    <VStack py="1rem" minH={{ sm: "400px", md: "600px" }} align="center" justify="center">
      <Box borderColor="purple.500" borderWidth="1px" borderRadius="8px" py="1rem" px="2.5rem">
        {props.children}{" "}
      </Box>
    </VStack>
  );
};

export default CenteredFrame;
