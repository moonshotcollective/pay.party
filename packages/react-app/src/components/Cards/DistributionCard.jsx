import { useColorModeValue } from "@chakra-ui/color-mode";
import { Avatar, Divider, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react";
import { blockExplorer } from "../../App";
import AddressChakra from "../AddressChakra";

function DistributionCard({ candidates, candidateMap, mainnetProvider }) {
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

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
              <Th>Quadratic Score</Th>
              <Th>Allocation</Th>
              <Th>Amount</Th>
            </Tr>
          </Thead>
          <Tbody>
            {candidates.map(member => (
              <Tr key={member}>
                <Td>
                  <AddressChakra
                    address={member}
                    ensProvider={mainnetProvider}
                    blockExplorer={blockExplorer}
                  ></AddressChakra>
                </Td>
                <Td>{candidateMap && candidateMap.get(member).voted && <Text>Voted</Text>}</Td>
                <Td>
                  <Text>{candidateMap && candidateMap.get(member).score}</Text>
                </Td>
                <Td>
                  <Text>{candidateMap && candidateMap.get(member).allocation}%</Text>
                </Td>
                <Td>
                  <Text color="yellow.500">{candidateMap && candidateMap.get(member).payoutFromWei} ETH</Text>
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
