import { useToast, Box, Button, Text, Center, Tooltip, Input, Tag, TagLabel, TagRightIcon } from "@chakra-ui/react";
import { QuestionOutlineIcon, CopyIcon } from "@chakra-ui/icons";
import React, { useState } from "react";

export const Metadata = ({ partyData, mainnetProvider, votesData, distribution, strategy }) => {
  const [cpText, setCpText] = useState("Copy URL");
  const toast = useToast();
  return (
    <Box>
      <Center pt={4}>
        <Text fontWeight="semibold" fontSize="lg">
          Party
        </Text>
      </Center>
      <Center pt={4}>
        <Text fontSize="xl">{`${partyData.name}`}</Text>
      </Center>
      <Center pt={4}>
        <Tooltip label={cpText}>
          <Button
            size="xs"
            rightIcon={<CopyIcon />}
            variant="outline"
            onClick={_ => {
              navigator.clipboard.writeText(window.location.href);
            }}
          >
            {window.location.href}
          </Button>
        </Tooltip>
      </Center>
      <Center pt={4} pl="5%" pr="5%">
        <Text fontSize="sm">{`${partyData.description}`}</Text>
      </Center>
      <Center p="4">
        <Text fontWeight="semibold" fontSize="lg">
          Voted:
          {` ${partyData?.ballots?.length}/${partyData?.participants?.length}`}
        </Text>
      </Center>
    </Box>
  );
};
