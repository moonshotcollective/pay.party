import { Avatar, Box, Button, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
function ElectionCard() {
  const router = useRouter();

  function openElection() {
    router.push("/election/exampleId");
  }

  return (
    <Box
      borderColor="purple.500"
      borderWidth="1px"
      borderRadius="8px"
      py="2.5rem"
      px="2.5rem"
    >
      <Heading fontSize="1.5rem" color="violet.50">
        Election Title
      </Heading>
      <Text pt="1rem" pb="2rem">
        <Avatar
          mr="0.5rem"
          boxSize="1.5em"
          src="https://siasky.net/AAB-yQ5MuGLqpb5fT9w0gd54RbDfRS9sZDb2aMx9NeJ8QA"
        />
        huxwell.eth
      </Text>
      <Text pb="2rem" fontSize="1rem">
        This is an election description that is maximum 2 lines long
      </Text>
      <Text color="violet.50" fontSize="1rem">
        100ETH 1/16 voted Active
      </Text>
      <Text color="violet.50" pb="2rem" fontSize="1rem">
        Created on 2021-09-13
      </Text>
      <Button w="100%" fontSize="md" onClick={openElection}>
        View Election
      </Button>
    </Box>
  );
}

export default ElectionCard;
