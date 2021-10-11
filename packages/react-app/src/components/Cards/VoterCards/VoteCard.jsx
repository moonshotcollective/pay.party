import React, { useEffect, useState } from "react";
import { Text, Box, Heading, VStack, HStack, Divider, Avatar } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";
import VoteInput from "../../Inputs/VoteInput";
import { blockExplorer } from "../../../App";
import AddressChakra from "../../AddressChakra";

function VoteCard({ candidates, candidateMap, voteAllocation, votesLeft, addVote, minusVote, mainnetProvider }) {
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

  useEffect(() => {
    console.log({ candidateMap });
  }, [candidateMap]);

  return (
    <VStack align="left" w="100%" spacing="0.5rem">
      <Heading fontSize="1.5rem" color={headingColor}>
        Vote
      </Heading>
      <Text pb="2rem" fontSize="1rem">
        Vote each member based on their contributions.
        <br /> You have {votesLeft}/{voteAllocation} votes left.
      </Text>
      <VStack w="100%" align="left" spacing="1rem">
        {candidates.map(member => (
          <Box key={member}>
            <HStack justify="space-between">
              <AddressChakra
                address={member}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
              ></AddressChakra>
              <VoteInput
                addVote={() => addVote(member)}
                minusVote={() => minusVote(member)}
                votes={candidateMap && candidateMap.get(member).votes}
              />
            </HStack>
            <Divider />
          </Box>
        ))}
      </VStack>
    </VStack>
  );
}

export default VoteCard;
