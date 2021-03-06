import { Avatar, Box, Button, Heading, Text, Tag, HStack, VStack } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { useContext } from "react";
import { fromWei } from "web3-utils";

import { Address } from "../index";
import { CERAMIC_PREFIX } from "../../dips/helpers";
import { Web3Context } from "../../helpers/Web3Context";

function ElectionCard({ id, name, owner, voted, active, isPaid, createdAt, amount, tokenSymbol, election, mainnetProvider }) {
  const { blockExplorer } = useContext(Web3Context);
  const routeHistory = useHistory();

  function viewElection() {
    const isCeramicRecord = id.startsWith(CERAMIC_PREFIX);
    const electionId = isCeramicRecord ? id.split(CERAMIC_PREFIX)[1] : id;
    routeHistory.push("/election/" + electionId + `?kind=${isCeramicRecord ? "ceramic" : "offChain"}`);
  }

  return (
    <Box borderColor="purple.500" borderWidth="1px" borderRadius="8px" py="1.5rem" px="2.5rem" width="100%">
      <HStack spacing={4} justifyContent="space-between">
        <Heading fontSize="1.5rem" color="violet.50">
          {name}
        </Heading>
      </HStack>
      <HStack spacing={2} pb={4}>
        <Tag size="sm" variant="solid" colorScheme={active ? "green" : "gray"}>
          {active ? "Active" : "Inactive"}
        </Tag>
        {/* <Tag size="sm" variant="solid" colorScheme={isPaid ? "gray" : "green"}>
          {isPaid ? "" : "Paid"}
        </Tag>
        <Tag size="sm" variant="solid" colorScheme="purple">
          {voted} voted
        </Tag> */}
      </HStack>
      <Address address={owner} fontSize="14pt" ensProvider={mainnetProvider} blockExplorer={blockExplorer} />
      <Text py="2rem" fontSize="1rem">
        {/* This is an election description that is maximum 2 lines long */}
      </Text>
      <Text color="violet.50" fontSize="1rem">
        Fund: {amount} {tokenSymbol || "ETH"}
      </Text>
      <Text color="violet.50" pb="2rem" fontSize="1rem">
        Created on {createdAt}
      </Text>
      <Button w="100%" fontSize="md" onClick={viewElection}>
        View Election
      </Button>
    </Box>
  );
}

export default ElectionCard;
