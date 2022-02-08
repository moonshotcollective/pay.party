import { useColorModeValue } from "@chakra-ui/color-mode";
import { Box, HStack, Text } from "@chakra-ui/react";
import React from "react";
import QDIcon from "./Icons/QDIcon";
// displays a page header

export default function Header() {
  // Chakra UI color mode
  const headingColor = useColorModeValue("#6e3ff5", "#f1c100");
  return (
    <Box pb={0}>
      <HStack>
        <QDIcon size={24} />
        <Text color={headingColor} fontSize="5xl">
            pay.party
        </Text>
      </HStack>
    </Box>
  );
}
