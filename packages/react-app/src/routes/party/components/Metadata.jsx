import { useToast, Box, Button, Text, Center, Tooltip, Link, Tag, HStack } from "@chakra-ui/react";
import { CopyIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { NETWORK } from "../../../constants";
import React, { useState } from "react";

export const Metadata = ({ partyData, mainnetProvider, votesData, distribution, strategy }) => {
  const [cpText, setCpText] = useState("Copy Party URL");
  const toast = useToast();
  const partyNetwork = NETWORK(partyData.config.chainId);
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
      <Center pt={4} pl="5%" pr="5%">
        <HStack>
          <Text fontSize="xs">{`Signature: ${partyData.signed.signature.substr(
            0,
            6,
          )}...${partyData.signed.signature.substr(
            partyData.signed.signature.length - 4,
            partyData.signed.signature.length,
          )}`}</Text>
          <Tag variant="outline" size="sm">
            {partyNetwork && partyNetwork.name}
          </Tag>
        </HStack>
      </Center>
      <Center pt={4}>
        <Tooltip label={cpText}>
          <Button
            size="xs"
            rightIcon={<CopyIcon />}
            variant="link"
            onClick={_ => {
              navigator.clipboard.writeText(window.location.href);
            }}
          >
            Share Party
          </Button>
        </Tooltip>
      </Center>
      <Center pt={4} pl="5%" pr="5%">
        <Text fontSize="sm">{`${partyData.description}`}</Text>
      </Center>
      <Center pt={4} pl="5%" pr="5%">
        <Text>
          To know more about how voting, distribution etc works, check out our
          <Link href="https://pay.party" isExternal m="2">
            FAQ page <ExternalLinkIcon mx="2px" />
          </Link>
        </Text>
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
