import { Avatar, Box, Button, Heading, Text } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";

function ElectionCard({ id, name, owner, voted, status, createdAt, amount }) {
  const routeHistory = useHistory();

  function openElection() {
    // router.push("/election/exampleId");
    routeHistory.push(`/vote/${id}`);
  }

  return (
    <Box borderColor="purple.500" borderWidth="1px" borderRadius="8px" py="2.5rem" px="2.5rem">
      <Heading fontSize="1.5rem" color="violet.50">
        {name}
      </Heading>
      <Text pt="1rem" pb="2rem">
        <Avatar mr="0.5rem" boxSize="1.5em" src="https://siasky.net/AAB-yQ5MuGLqpb5fT9w0gd54RbDfRS9sZDb2aMx9NeJ8QA" />
        {owner}
      </Text>
      <Text pb="2rem" fontSize="1rem">
        This is an election description that is maximum 2 lines long
      </Text>
      <Text color="violet.50" fontSize="1rem">
        {amount} ETH {voted} voted {status ? "Active" : "Inactive"}
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
