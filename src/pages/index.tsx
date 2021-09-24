import {
  Box,
  Text,
  Button,
  Heading,
  VStack,
  HStack,
  Divider,
} from "@chakra-ui/react";
import BasicButton from "../components/Button/BasicButton";
import { FiCircle } from "react-icons/fi";

const Home = () => {
  return (
    <Box mb={8} w="full">
      <HStack>
        <VStack align="left">
          <Heading color="yellow.100">Quadratic Diplomacy</Heading>
          <Text color="violet.100"> by MOONSHOT COLLECTIVE </Text>
          <Text>
            Distribute tokens among your team members based on quadratic voting.{" "}
          </Text>
          <BasicButton text="Launch App" />
        </VStack>
        <Box w="350px"></Box>
      </HStack>
      <Divider mt="8" />
      <VStack mt="8" spacing="4">
        <Heading size="md" color="yellow.100">
          How it Works
        </Heading>
        <HStack>
          <Box m="2">
            <FiCircle />
            <Text>Select team members you’ve worked with </Text>
          </Box>
          <Box m="2">
            <FiCircle />
            <Text>Select team members you’ve worked with </Text>
          </Box>
          <Box m="2">
            <FiCircle />
            <Text>Select team members you’ve worked with </Text>
          </Box>
        </HStack>
      </VStack>
      <Divider mt="8" />

      <VStack align="left" p="4">
        <Heading size="md" color="yellow.100">
          FAQs
        </Heading>
        <Text color="violet.100">Lorem ipsum dolor sit amet?</Text>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea{" "}
        </Text>
      </VStack>
    </Box>
  );
};

export default Home;
