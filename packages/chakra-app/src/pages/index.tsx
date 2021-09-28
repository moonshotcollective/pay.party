import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Divider,
  Button,
} from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Link, SimpleGrid } from "@chakra-ui/layout";

import QDIcon from "../components/Icons/QDIcon";
import Circle from "../components/Circles/Circle";

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
          <Text pt="10" fontSize="20px">
            Distribute tokens among your team members based on quadratic voting.{" "}
          </Text>
          <Box maxW="300px" pt="10">
            <NextLink href="/dapp" passHref>
              <Button w="239px" h="51px" fontSize="xl">
                Go to Voter
              </Button>
            </NextLink>
          </Box>
          <Box maxW="300px" pt="10">
            <NextLink href="/admin" passHref>
              <Button w="239px" h="51px" fontSize="xl">
                Go to Admin
              </Button>
            </NextLink>
          </Box>
        </VStack>
        <Box w="300px"></Box>
      </HStack>

      <Divider mt="16" backgroundColor="purple.500" />

      <VStack mt="16" spacing="4" align="left">
        <Heading size="md" color={headingColor}>
          How it Works
        </Heading>
        <SimpleGrid
          columns={{
            sm: 1,
            md: 3,
          }}
          spacing={4}
        >
          <HStack>
            <Box>
              <Circle text="1" />
            </Box>
            <Text>Select team members you’ve worked with</Text>
          </HStack>

          <HStack>
            <Box>
              <Circle text="2" />
            </Box>
            <Text>Vote each member with your allocated number of votes</Text>
          </HStack>

          <HStack>
            <Box>
              <Circle text="3" />
            </Box>
            <Text>Tokens will be distributed based on quadratic voting</Text>
          </HStack>
        </SimpleGrid>
      </VStack>
      <Divider mt="16" backgroundColor="purple.500" />

      <VStack mt="16" spacing="4" align="left">
        <Heading size="md" color={headingColor}>
          FAQs
        </Heading>
        <Text color="purple.500" fontWeight="bold">
          Why did you build Quadratic Diplomacy?
        </Text>
        <Text>
          The{" "}
          <Link
            textDecoration="none"
            href="https://moonshotcollective.space/"
            isExternal
          >
            Moonshot Collective
          </Link>{" "}
          is looking for a decentralized way to allocate tokens to each other.
          Instead of token allocation being driven by central parties, the
          entire collective can decide how many tokens each member of the
          collective gets. This will decentralize the way members are rewarded
          for their participation, and lead to those whom are most familiar with
          each others work being responsible for allocation decision making.
        </Text>
        <Text color="purple.500" fontWeight="bold">
          Is Quadratic Diplomacy Open Source?
        </Text>
        <Text>Yes</Text>
        <Text color="purple.500" fontWeight="bold">
          Can I use Quadratic Diplomacy for my DAO?
        </Text>
        <Text>Yes</Text>
        <Text color="purple.500" fontWeight="bold">
          Does Quadratic Diplomacy cost anything?
        </Text>
        <Text>No</Text>
      </VStack>
      <Divider mt="16" backgroundColor="purple.500" />
    </Box>
  );
};

export default Home;
