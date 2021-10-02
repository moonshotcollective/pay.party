import {
  Text,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";

function NotMemberCard() {
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

  return (
    <VStack align="left" w="100%" spacing="0.5rem">
      <Heading fontSize="1.5rem" color={headingColor}>
        Not a member
      </Heading>
      <Text pb="2rem" fontSize="1rem">
        You are not part of the members of this election.
      </Text>
    </VStack>
  );
}

export default NotMemberCard;
