import {
  Box,
  HStack,
  Text,
  Center,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  Badge,
  Link,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import React, { useState, useMemo } from "react";
import { utils } from "ethers";

export const ReceiptsTable = ({ partyData, targetNetwork }) => {
  const [isLoading, setIsLoading] = useState(true);

  const receiptRows = useMemo(() => {
    const row =
      partyData &&
      partyData.receipts &&
      partyData.receipts.map(r => {
        return (
          <Tbody key={`view-row-${r.txn}`}>
            <Tr>
              <Td>
                <Box>
                  {/* <HStack p="1">
                    <Text>Timestamp:</Text>
                    <Text>{"Nah"}</Text>
                  </HStack> */}
                  {typeof r.amount == "string" && r.amount !== "" && (
                    <HStack p="1">
                      <Text>Amount:</Text>
                      <Text>{utils.formatEther(r.amount)}</Text>
                    </HStack>
                  )}

                  {r.token && r.token !== "" && (
                    <HStack p="1">
                      <Text>ERC-20:</Text>
                      <Badge w="min">
                        <Link href={`${targetNetwork.blockExplorer}address/${r.token}`} isExternal>
                          {r.token}
                          <ExternalLinkIcon mx="2px" />
                        </Link>
                      </Badge>
                    </HStack>
                  )}
                  <HStack p="1">
                    <Text>Txn:</Text>
                    <Badge colorScheme="green" w="min">
                      <Link href={`${targetNetwork.blockExplorer}tx/${r.txn}`} isExternal>
                        {r.txn}
                        <ExternalLinkIcon mx="2px" />
                      </Link>
                    </Badge>
                  </HStack>
                </Box>
              </Td>
            </Tr>
          </Tbody>
        );
      });
    return row;
  }, [
    partyData,
  ]);

  return (
    <Box pt="10">
      <Table borderWidth="1px">
        <Thead>
          <Tr>
            <Th>
              <Center>Payout History</Center>
            </Th>
          </Tr>
        </Thead>
        {receiptRows}
        <Tfoot></Tfoot>
      </Table>
    </Box>
  );
};
