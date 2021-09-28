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
