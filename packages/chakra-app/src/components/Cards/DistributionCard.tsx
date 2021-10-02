import { useColorModeValue } from "@chakra-ui/color-mode";
import {
  Avatar,
  Divider,
  Heading,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";

function DistributionCard() {
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

  const members = [
    { address: "0xad", votes: 7 },
    { address: "0xad", votes: 14 },
    { address: "0xad", votes: 2 },
    { address: "0xad", votes: 21 },
  ];
  return (
    <VStack align="start" w="100%" spacing="0.5rem">
      <Heading fontSize="1.5rem" color={headingColor}>
        Current Distribution
      </Heading>
      <Text pb="2rem" fontSize="1rem">
        Note that payout distribution might still change as more members vote.
      </Text>
      <VStack w="100%" align="left" spacing="1rem">
        <Divider />
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
      </VStack>
    </VStack>
  );
}

export default DistributionCard;
