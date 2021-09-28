import { Box, Heading, Text, VStack, HStack, Button } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";

import Link from "next/link";
import QDIcon from "../Icons/QDIcon";

import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

  return (
    // <Box>
    //   <VStack align="left">
    //     <Box>
    //       <Heading color={headingColor}>Quadratic Diplomacy</Heading>
    //       <QDIcon />
    //     </Box>

    //   </VStack>
    //   <Box>
    //     <ThemeToggle />
    //     <ThemeToggle />
    //   </Box>
    // </Box>
    <Box>
      <HStack justify="space-between" w="100%" h={16}>
        <VStack align="left" spacing="0">
          <HStack>
            <Heading fontSize="md" color={headingColor}>
              Quadratic Diplomacy
            </Heading>
            <QDIcon />
          </HStack>
          <Text fontSize="xs" color="purple.500" fontWeight="bold" as="i">
            by MOONSHOT COLLECTIVE{" "}
          </Text>
        </VStack>

        <HStack>
          <ThemeToggle />
          <Button fontSize="md">
            Connect Wallet
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};

export default Header;
