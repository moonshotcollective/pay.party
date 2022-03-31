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
  Spinner,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import React, { useState, useMemo } from "react";
import { List } from "antd";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { utils } from "ethers";


export default function ReceiptEventsTable({ contracts, contractName, tokenEventName, ethEventName, localProvider, mainnetProvider, startBlock, partyData, targetNetwork }) {
  // 📟 Listen for broadcast events
  try {
    const tokenEvents = useEventListener(contracts, contractName, tokenEventName, localProvider, startBlock);
    const ethEvents = useEventListener(contracts, contractName, ethEventName, localProvider, startBlock);
    const idHash = partyData.id && utils.keccak256(utils.toUtf8Bytes(partyData.id));
    let [payoutStatus, setPayoutStatus] = useState(false);
    //console.log(idHash);
    //console.log(events);
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
        {payoutStatus ? null : (<Center p="5">No payouts have been made yet!</Center>)}
        <List
          bordered
          dataSource={tokenEvents}
          renderItem={item => {
            return (
              item.args.id.hash == idHash ? (
                <List.Item key={item.blockNumber + "_" + item.args.sender + "_" + item.args.id}>
                
                <Text>Payout Transaction:</Text>
                      <Badge colorScheme="green" w="min">
                        <Link href={`${targetNetwork.blockExplorer}tx/${item.transactionHash}`} isExternal>
                          {item.transactionHash}
                          {setPayoutStatus(true)}
                          <ExternalLinkIcon mx="2px" />
                        </Link>
                    </Badge>
                </List.Item>) : null   
            );
          }}
        />
        <List
          bordered
          dataSource={ethEvents}
          renderItem={item => {
            return (
              item.args.id.hash == idHash ? (
                <List.Item key={item.blockNumber + "_" + item.args.sender + "_" + item.args.id}>

                   <Text>Payout Transaction:</Text>
                      <Badge colorScheme="green" w="min">
                        <Link href={`${targetNetwork.blockExplorer}tx/${item.transactionHash}`} isExternal>
                          {item.transactionHash}
                          {setPayoutStatus(true)}
                          <ExternalLinkIcon mx="2px" />
                        </Link>
                    </Badge>
                </List.Item>) : null     
            );
          }}
        />
          <Tfoot></Tfoot>
        </Table>
      </Box>
    );
  } catch (error) {
      console.log(error);
  }
}
