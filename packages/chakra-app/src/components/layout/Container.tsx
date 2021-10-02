import { VStack } from "@chakra-ui/react";
import React from "react";

interface Children {
  children: React.ReactNode;
}
const Container = (props: Children) => {
  return (
    <VStack p="16" w="full" minH={{ sm: "400px", md: "600px" }}>
      {props.children}
    </VStack>
  );
};

export default Container;
