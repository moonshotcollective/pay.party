import React from "react";
import { Box, Text, Heading, VStack, HStack, Divider, Button, IconButton } from "@chakra-ui/react";
import { useColorModeValue, useColorMode} from "@chakra-ui/color-mode";
import QDIcon from "./Icons/QDIcon";
// import { MoonIcon, SunIcon } from "@chakra-ui/icons";
// displays a page header

export default function Header() {
  // Chakra UI color mode
  // const { colorMode, toggleColorMode } = useColorMode();
  const headingColor = useColorModeValue("#6e3ff5", "#f1c100");
  return (
    <Box pb={0}>
      <HStack align="center">
        <QDIcon size={16} />
        <Text color={headingColor} fontSize="5xl">
          pay.party
        </Text>
        {/* <IconButton variant='ghost' icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />} onClick={toggleColorMode}/> */}
      </HStack>
    </Box>
  );
}
