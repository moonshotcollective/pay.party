import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Avatar, Box, Button, Heading, Text } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { blockExplorer } from "../../App";
import AddressChakra from "../AddressChakra";

function ElectionCard({ name, creator, voted, active, amount, tokenSymbol, createdAt, mainnetProvider }) {
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
        {name}
      </Heading>

      <Text pb="1rem" fontSize="1rem">
        This is an election description that is maximum 2 lines long
      </Text>
      <Text fontSize="1rem" color="violet.500">
        Admin
      </Text>
      {/* <Text pt="1rem" pb="2rem">
        <Avatar mr="0.5rem" boxSize="1.5em" src="https://siasky.net/AAB-yQ5MuGLqpb5fT9w0gd54RbDfRS9sZDb2aMx9NeJ8QA" />
        {creator}
      </Text> */}
      <AddressChakra
        address={creator}
        ensProvider={mainnetProvider}
        blockExplorer={blockExplorer}
        pb="1rem"
      ></AddressChakra>
      <Text pt="1rem" fontSize="1rem" color="violet.500" mb="0">
        Total Funds
      </Text>
      <Text>
        {amount} {tokenSymbol}
      </Text>
      <Text fontSize="1rem" color="violet.500" mb="0">
        Voters
      </Text>
      <Text>{voted} Voted</Text>
      <Text fontSize="1rem" color="violet.500" mb="0">
        Status
      </Text>
      <Text>{active ? "Active" : "Inactive"}</Text>
      <Text fontSize="1rem" color="violet.500" mb="0">
        Created on
      </Text>
      <Text pb="2rem">{createdAt}</Text>

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
