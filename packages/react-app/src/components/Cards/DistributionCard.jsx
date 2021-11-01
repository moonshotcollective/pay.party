import { useColorModeValue } from "@chakra-ui/color-mode";
import { Avatar, Divider, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, VStack, Tooltip } from "@chakra-ui/react";
import { blockExplorer } from "../../App";
import AddressChakra from "../AddressChakra";

function DistributionCard({ candidates, candidateMap, mainnetProvider, isPaid, tokenSym }) {
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

  return (
    <VStack align="start" w="100%" spacing="0.5rem">
      {!isPaid && (
        <Heading fontSize="1.5rem" color={headingColor}>
          Current Distribution
        </Heading>
      )}
      {isPaid && (
        <Heading fontSize="1.5rem" color={headingColor}>
          Final Distribution
        </Heading>
      )}
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
                <Td>
                  {candidateMap && candidateMap.get(member).voted && <Text color="green.600">Voted</Text>}{" "}
                  {candidateMap && !candidateMap.get(member).voted && isPaid && <Text color="red.600">Absent</Text>}
                </Td>
                <Td>
                  <Text>{candidateMap && candidateMap.get(member).score}</Text>
                </Td>
                <Td>
                  <Text>{candidateMap && candidateMap.get(member).allocation}%</Text>
                </Td>
                <Td>
                  <Tooltip label={candidateMap && candidateMap.get(member).payoutFromWei} aria-label="A tooltip">
                    <Text color="yellow.500">
                      {candidateMap && Number.parseFloat(candidateMap.get(member).payoutFromWei).toFixed(4)} {tokenSym}
                    </Text>
                  </Tooltip>
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
