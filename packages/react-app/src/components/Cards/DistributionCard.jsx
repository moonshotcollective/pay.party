import { useColorModeValue } from "@chakra-ui/color-mode";
import { Avatar, Divider, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, VStack, Tooltip } from "@chakra-ui/react";
import { blockExplorer } from "../../App";
import AddressChakra from "../AddressChakra";
import { fromWei, toWei, toBN, numberToHex } from "web3-utils";

function DistributionCard({ candidates, scores, percent, allocations, fundAllocation, candidateMap, mainnetProvider, isPaid, tokenSym }) {
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

  // const calcPercentAllocation = score => {
  //   const total = scores.reduce((x, y) => x + y); 
  //   return score/total;
  // }

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
              {/* <Th>Voted</Th> */}
              <Th>Quadratic Score</Th>
              <Th>Allocation</Th>
              <Th>Amount</Th>
            </Tr>
          </Thead>
          <Tbody>
            {candidates.map((member, i) => (
              <Tr key={member}>
                <Td>
                  <AddressChakra
                    address={member}
                    ensProvider={mainnetProvider}
                    blockExplorer={blockExplorer}
                  ></AddressChakra>
                </Td>
                {/* <Td>
                  {candidateMap && candidateMap.get(member).voted && <Text color="green.600">Voted</Text>}{" "}
                  {candidateMap && !candidateMap.get(member).voted && isPaid && <Text color="red.600">Absent</Text>}
                </Td> */}
                <Td>
                  <Text>{scores[i]}</Text>
                </Td>
                <Td>
                  <Text>{percent[i]}%</Text>
                </Td>
                <Td>
                  <Tooltip label={ allocations[i]} aria-label="Amount">
                    <Text color="yellow.500">
                      {/* {Number.parseFloat(allocations[i]).toFixed(4)} */}
                      {Number.parseFloat(allocations[i]).toFixed(4)}
                      {/* {calcPercentAllocation(scores[i]) * fundAllocation} */}
                      {/* {candidateMap && Number.parseFloat(calcPercentAllocation(scores[i]) * fundAllocation).toFixed(4)} {tokenSym} */}
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
