import { useToast, Box, Button, Text, Center, Tooltip, Tag, HStack, Spacer } from "@chakra-ui/react";
import { useHistory, Link } from "react-router-dom";
import { CopyIcon, ExternalLinkIcon, QuestionOutlineIcon } from "@chakra-ui/icons";
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
        </HStack>
      </Center>
      <Center pt={4} pl="5%" pr="5%">
        <HStack>
          <Text fontSize="xs">Vote On: </Text>
          <Tag variant="outline" size="sm">
            {partyNetwork && partyNetwork.name}
          </Tag>
        </HStack>
      </Center>
      <Center pt={4}>
        <HStack>
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
          <Spacer />
          <Tooltip label="Frequently Asked Questions">
            <Button size="sm" variant="link" as={Link} to="/faq" m="2" rightIcon={<QuestionOutlineIcon />}>
              FAQ
            </Button>
          </Tooltip>
        </HStack>
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
