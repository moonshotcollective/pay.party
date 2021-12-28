import React from "react";
import { Box, Text, HStack } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";
import QDIcon from "./Icons/QDIcon";
// displays a page header

export default function Header() {
  // Chakra UI color mode
  const headingColor = useColorModeValue("#6e3ff5", "#f1c100");
  return (
    <Box pb={0}>
      <HStack align="center">
        <QDIcon size={72} />
        <Text color={headingColor} fontSize="5xl">
          pay.party
        </Text>
      </HStack>
    </Box>
  );
}
