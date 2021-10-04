import { Avatar, Box, Button, Heading, Text, Tag, HStack } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { Address } from "../index";
import { blockExplorer } from "../../App";

function ElectionCard({ id, name, owner, voted, active, createdAt, amount, mainnetProvider }) {
  const routeHistory = useHistory();

  function openElection() {
    // router.push("/election/exampleId");
    routeHistory.push(`/vote/${id}`);
  }

  return (
    <Box borderColor="purple.500" borderWidth="1px" borderRadius="8px" py="1.5rem" px="2.5rem">
      <Heading fontSize="1.5rem" color="violet.50">
        {name}
      </Heading>
      <HStack spacing={4}>
        {["sm", "md", "lg"].map(size => (
          <Tag size={size} key={size} variant="solid" colorScheme="teal">
            Teal
          </Tag>
        ))}
      </HStack>
      <Address address={owner} fontSize="14pt" ensProvider={mainnetProvider} blockExplorer={blockExplorer} />
      <Text pb="2rem" fontSize="1rem">
        This is an election description that is maximum 2 lines long
      </Text>
      <Text color="violet.50" fontSize="1rem">
        {amount} ETH {voted} voted {active ? "Active" : "Inactive"}
      </Text>
      <Text color="violet.50" pb="2rem" fontSize="1rem">
        Created on {createdAt}
      </Text>
      <Button w="100%" fontSize="md" onClick={openElection}>
        View Election
      </Button>
    </Box>
  );
}

export default ElectionCard;
