import {
  Text,
  Heading,
  VStack,
  Divider,
  Checkbox,
  Avatar,
} from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";

function SelectMemberCard() {
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

  const members = ["0xad", "0xad", "0xad", "0xad", "0xad", "0xad"];
  return (
    <VStack align="left" w="100%" spacing="0.5rem">
      <Heading fontSize="1.5rem" color={headingColor}>
        1. Select members
      </Heading>
      <Text pb="2rem" fontSize="1rem">
        Select members you have been working with.
      </Text>
      <VStack w="100%" align="left" spacing="1rem">
        <Checkbox colorScheme="purple">
          <Text ml="1rem">Select All</Text>
        </Checkbox>
        <Divider />
        {members.map((member) => (
          <>
            <Checkbox colorScheme="purple">
              <Text ml="1rem">
                <Avatar
                  mr="0.5rem"
                  boxSize="1.5em"
                  src="https://siasky.net/AAB-yQ5MuGLqpb5fT9w0gd54RbDfRS9sZDb2aMx9NeJ8QA"
                />
                {member}
              </Text>
            </Checkbox>
            <Divider />
          </>
        ))}
      </VStack>
    </VStack>
  );
}

export default SelectMemberCard;
