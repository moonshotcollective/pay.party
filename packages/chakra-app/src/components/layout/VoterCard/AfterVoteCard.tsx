import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Divider,
  Button,
  Checkbox,
  Avatar,
} from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";

// import AvatarImage from "./avatar.png";

function AfterVoteCard() {
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

  const members = [
    { address: "0xad", votes: 7 },
    { address: "0xad", votes: 14 },
    { address: "0xad", votes: 2 },
    { address: "0xad", votes: 21 },
  ];
  return (
    <VStack align="left" w="100%" spacing="0.5rem">
      <Heading fontSize="1.5rem" color={headingColor}>
        3. Thank you for voting!
      </Heading>
      <Text pb="2rem" fontSize="1rem">
        The allocation for this workstream will be informed by your votes.
        <br /> See you next month!
      </Text>
      <VStack w="100%" align="left" spacing="1rem">
        {members.map((member) => (
          <>
            <HStack justify="space-between">
              <Text>
                <Avatar
                  mr="0.5rem"
                  boxSize="1.5em"
                  src="https://siasky.net/AAB-yQ5MuGLqpb5fT9w0gd54RbDfRS9sZDb2aMx9NeJ8QA"
                />
                {member.address}
              </Text>
              <Text>{member.votes} votes</Text>
            </HStack>
            <Divider />
          </>
        ))}
      </VStack>
    </VStack>
  );
}

export default AfterVoteCard;
