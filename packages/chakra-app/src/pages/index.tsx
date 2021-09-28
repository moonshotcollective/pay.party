import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Divider,
  Button,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useColorModeValue } from "@chakra-ui/color-mode";
import Link from "next/link";
import QDIcon from "../components/Icons/QDIcon";

import NextLink from "next/link";

const Home = () => {
  const headingColor = useColorModeValue("yellow.600", "yellow.500");
  return (
    <Box mb={8} w="full">
      <HStack>
        <VStack align="left">
          <HStack align="center">
            <Heading color={headingColor}>Quadratic Diplomacy</Heading>
            <QDIcon />
          </HStack>
          <Text color="purple.500" fontWeight="bold">
            {" "}
            by MOONSHOT COLLECTIVE{" "}
          </Text>
          <Box maxW="300px" pt="10">
            <NextLink href="/dapp" passHref>
              <Button w="239px" h="51px" fontSize="xl">
                Go to Dapp
              </Button>
            </NextLink>
          </Box>
        </VStack>
      </HStack>

      <VStack mt="16" spacing="4" align="left">
        <HStack justifyContent="space-between">
          <Heading size="md" color={headingColor}>
            Elections
          </Heading>
          <Box>
            <Link href="/create-election" passHref>
              <Button leftIcon={<AddIcon />}>Create Election</Button>
            </Link>
          </Box>
        </HStack>
      </VStack>
      <Divider mt="16" backgroundColor="purple.500" />
    </Box>
  );
};

export default Home;
