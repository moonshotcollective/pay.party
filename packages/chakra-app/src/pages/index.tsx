import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Divider,
  Button,
  Flex,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useColorModeValue } from "@chakra-ui/color-mode";
import Link from "next/link";

import QDIcon from "../components/Icons/QDIcon";

import NextLink from "next/link";
import { useMoralis } from "react-moralis";
import NotConnectedCard from "../components/Cards/NotConnectedCard";
import CenteredFrame from "../components/layout/CenteredFrame";
import AdminHomeCard from "../components/Cards/AdminCards/AdminHomeCard";

const Home = () => {
  const headingColor = useColorModeValue("yellow.600", "yellow.500");
  const { isAuthenticated } = useMoralis();
  if (!isAuthenticated) {
    return (
      <CenteredFrame>
        <NotConnectedCard />
      </CenteredFrame>
    );
  }
  return (
    <Box mb={8} w="full">
      <HStack>
        <VStack align="left">
          <HStack align="center">
            <Heading color={headingColor}>Quadratic Diplomacy</Heading>
            <QDIcon size="45px" />
          </HStack>
          <Text color="purple.500" fontWeight="bold">
            {" "}
            by MOONSHOT COLLECTIVE{" "}
          </Text>
          <HStack pt="10" spacing={6}>
            <NextLink href="/dapp" passHref>
              <Button px="2rem" py="1.5rem" fontSize="xl">
                Go to Dapp
              </Button>
            </NextLink>
            <NextLink href="/home" passHref>
              <Button px="2rem" py="1.5rem" fontSize="xl">
                Go to Home
              </Button>
            </NextLink>
          </HStack>
        </VStack>
      </HStack>
      <Box my="10">
        <VStack my="16" spacing="4" align="left">
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
        <Divider my="16" backgroundColor="purple.500" />
        <AdminHomeCard />
      </Box>
    </Box>
  );
};

export default Home;
