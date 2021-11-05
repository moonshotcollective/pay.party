import { useColorModeValue } from "@chakra-ui/color-mode";
import { Avatar, Divider, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, VStack, Tooltip } from "@chakra-ui/react";
import AddressChakra from "../AddressChakra";
import { fromWei, toWei, toBN, numberToHex } from "web3-utils";
import { useContext } from "react";
import { Web3Context } from "../../helpers/Web3Context";

function DistributionCard({
  candidates,
  scores,
  percent,
  allocations,
  fundAllocation,
  candidateMap,
  mainnetProvider,
  isPaid,
  tokenSym,
}) {
  const { blockExplorer } = useContext(Web3Context);
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
                <Td>
                  <Text>{scores[i] ? Number.parseFloat(scores[i]).toFixed(2) : "0"}</Text>
                </Td>
                <Td>
                  <Text>{Number.parseFloat(percent[i] * 100).toFixed(2)}%</Text>
                </Td>
                <Td>
                  <Tooltip label={allocations[i] ? allocations[i] + " (wei)" : "Loading..."} aria-label="Amount">
                    <Text color="yellow.500">
                      {allocations[i]
                        ? `${Number.parseFloat(fromWei(String(allocations[i]), "ether")).toFixed(4)} ${tokenSym}`
                        : "Loading..."}
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
