import { Avatar, Box, Button, Heading, Text, Tag, HStack, VStack } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { Address } from "../index";
import { blockExplorer } from "../../App";

import { CERAMIC_PREFIX } from "../../dips/helpers";

function ElectionCard({ id, name, owner, voted, active, createdAt, amount, tokenSymbol, election, mainnetProvider }) {
  const routeHistory = useHistory();

  function viewElection() {
    const isCeramicRecord = id.startsWith(CERAMIC_PREFIX);
    const electionId = isCeramicRecord ? id.split(CERAMIC_PREFIX)[1] : id;
    routeHistory.push("/election/" + electionId + `?kind=${isCeramicRecord ? "ceramic" : "offChain"}`);
  }

  return (
    <Box borderColor="purple.500" borderWidth="1px" borderRadius="8px" py="1.5rem" px="2.5rem">
      <HStack spacing={4} justifyContent="space-between">
        <Heading fontSize="1.5rem" color="violet.50">
          {name}
        </Heading>
        <VStack>
          <Tag size="sm" variant="solid" colorScheme={active ? "green" : "red"}>
            {active ? "Active" : "Inactive"}
          </Tag>
          <Tag size="sm" variant="solid" colorScheme="purple">
            {voted} voted
          </Tag>
        </VStack>
      </HStack>
      <Address address={owner} fontSize="14pt" ensProvider={mainnetProvider} blockExplorer={blockExplorer} />
      <Text py="2rem" fontSize="1rem">
        {/* This is an election description that is maximum 2 lines long */}
      </Text>
      <Text color="violet.50" fontSize="1rem">
        {amount} {tokenSymbol || "ETH"}
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
