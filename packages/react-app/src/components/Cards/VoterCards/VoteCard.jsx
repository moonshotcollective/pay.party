import React, { useContext, useEffect, useState } from "react";
import { Text, Box, Heading, VStack, HStack, Divider, Avatar } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";
import VoteInput from "../../Inputs/VoteInput";
import AddressChakra from "../../AddressChakra";
import { Web3Context } from "../../../helpers/Web3Context";

function VoteCard({ candidates, voteMap, voteAllocation, mainnetProvider }) {
  const { blockExplorer } = useContext(Web3Context);
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

  const [votesLeft, setVotesLeft] = useState(voteAllocation);

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
                addVote={() => {
                  const currentVotes = voteMap.get(member);
                  if (votesLeft > 0) {
                    setVotesLeft(votesLeft - 1);
                    voteMap.set(member, currentVotes + 1);
                    console.log(voteMap);
                  }
                }}
                minusVote={() => {
                  const currentVotes = voteMap.get(member);
                  if (votesLeft < voteAllocation && currentVotes > 0) {
                    setVotesLeft(votesLeft + 1);
                    voteMap.set(member, currentVotes - 1);
                    console.log(voteMap);
                  }
                }}
                votes={voteMap.get(member)}
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
