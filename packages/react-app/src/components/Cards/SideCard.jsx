import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Avatar, Box, Button, Heading, Text } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";

function ElectionCard() {
  const routeHistory = useHistory();
  function goBack() {
    routeHistory.push("/create");
  }

  return (
    <Box py="1.5rem" px="2.5rem">
      <Text w="fit-content" onClick={goBack} _hover={{ cursor: "pointer" }} pb="2rem">
        <ChevronLeftIcon />
        Back
      </Text>
      <Heading fontSize="1.5rem" color="violet.50">
        Election Title
      </Heading>

      <Text pb="2rem" fontSize="1rem">
        This is an election description that is maximum 2 lines long
      </Text>
      <Text fontSize="1rem">Admin</Text>
      <Text pt="1rem" pb="2rem">
        <Avatar mr="0.5rem" boxSize="1.5em" src="https://siasky.net/AAB-yQ5MuGLqpb5fT9w0gd54RbDfRS9sZDb2aMx9NeJ8QA" />
        huxwell.eth
      </Text>

      <Text fontSize="1rem">Funding</Text>
      <Text pt="1rem" pb="2rem">
        100 ETH
      </Text>
      <Text fontSize="1rem">Voters</Text>
      <Text pt="1rem" pb="2rem">
        1/16 Voted
      </Text>
      <Text fontSize="1rem">Status</Text>
      <Text pt="1rem" pb="2rem">
        Active
      </Text>
      <Text fontSize="1rem">Created</Text>
      <Text pt="1rem" pb="2rem">
        2021-09-03
      </Text>

      {/* If the suer is Admin show: */}
      <Button mb="1rem" w="full" variant="solid" bgColor="red.400">
        End Election
      </Button>
      <Button w="full" variant="outline">
        Configure Election
      </Button>
    </Box>
  );
}

export default ElectionCard;
