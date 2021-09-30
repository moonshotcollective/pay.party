import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Divider,
  Button,
  Avatar,
  Input,
  Icon,
  InputGroup,
  InputRightElement,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";

import { FiChevronDown } from "react-icons/fi";

function RewardMembersCard() {
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

  const members = [
    { address: "0xad", votes: 7 },
    { address: "0xad", votes: 14 },
    { address: "0xad", votes: 2 },
    { address: "0xad", votes: 21 },
  ];
  return (
    <VStack align="left" w="100%" spacing="0.5rem">
      <Heading fontSize="1.5rem" color={headingColor}>
        Reward Members
      </Heading>
      <Text pb="2rem" fontSize="1rem">
        Total votes: 64
      </Text>
      <VStack w="100%" align="left" spacing="1rem">
        <Divider />
        <HStack justify="space-between">
          <Text fontSize="1rem">Total amount to distribute</Text>
          <HStack>
            <Box w="5rem">
              <Input
                borderColor="purple.500"
                textAlign="center"
                readOnly
                placeholder="100"
              />
            </Box>
            <InputGroup w="5rem">
              <Input
                borderColor="purple.500"
                textAlign="center"
                readOnly
                placeholder="ETH"
              />
              <InputRightElement
                p="2.5"
                children={<Icon as={FiChevronDown} />}
              />
            </InputGroup>
          </HStack>
        </HStack>
        <Divider />
        <Text fontSize="1rem">Voters</Text>

        <Table variant="unstyled">
          <Thead>
            <Tr>
              <Th>Voter</Th>
              <Th>Voted</Th>
              <Th>Total</Th>
              <Th>Allocation</Th>
              <Th>Amount</Th>
            </Tr>
          </Thead>
          <Tbody>
            {members.map((member) => (
              <Tr>
                <Td>
                  <Text>
                    <Avatar
                      mr="0.5rem"
                      boxSize="1.5em"
                      src="https://siasky.net/AAB-yQ5MuGLqpb5fT9w0gd54RbDfRS9sZDb2aMx9NeJ8QA"
                    />
                    {member.address}
                  </Text>
                </Td>
                <Td>Voted</Td>
                <Td>
                  <Text>{member.votes} votes</Text>
                </Td>
                <Td> 13.2% allocation</Td>
                <Td>
                  <Text color="yellow.500">13.2 ETH</Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Divider />
        <Box align="end">
          <Button variant="outline">Pay</Button>
          <Button ml="0.5rem">Pay from Contract</Button>
        </Box>
      </VStack>
    </VStack>
  );
}

export default RewardMembersCard;
