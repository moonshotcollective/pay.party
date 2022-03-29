import { PartyTable } from "./PartyTable";
import { Collapse, Box, Button, Center, HStack, Spacer } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/core";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

export const MyParties = ({ data }) => {
  const { isOpen, onToggle } = useDisclosure();
  return (
    <Box m="10">
      <Center m="5">
        <HStack>
          <Spacer />
        </HStack>
        <Button onClick={onToggle} variant="link" rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}>
          My Parties
        </Button>
      </Center>
      <Center>
        <Collapse in={isOpen} animateOpacity>
          <PartyTable parties={data} />
        </Collapse>
      </Center>
    </Box>
  );
};
