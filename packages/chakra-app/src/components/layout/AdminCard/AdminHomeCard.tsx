import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { FiChevronRight } from "react-icons/fi";

enum CardEnum {
  NotConnectedCard,
  NotMember,
  SelectMemberCard,
  AddMembersCard,
  AdminHomeCard,
  RewardMembersCard,
}

function AdminHomeCard({ changeActive }: any) {
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

  const members = ["0xad", "0xad", "0xad", "0xad", "0xad", "0xad"];

  return (
    <VStack align="left" w="100%" spacing="0.5rem">
      <Heading fontSize="1.5rem" color={headingColor}>
        Admin
      </Heading>
      <VStack w="100%" align="left" spacing="1rem">
        <Divider pt="2rem" />
        <Box
          as="button"
          _hover={{ filter: "brightness(150%)" }}
          onClick={() => changeActive(CardEnum.AddMembersCard)}
        >
          <HStack py="1rem" justify="space-between">
            <Text>Add members to election</Text>
            <Icon as={FiChevronRight} />
          </HStack>
        </Box>
        <Box
          as="button"
          _hover={{ filter: "brightness(150%)" }}
          onClick={() => changeActive(CardEnum.RewardMembersCard)}
        >
          <HStack py="1rem" justify="space-between">
            <Text>Reward members</Text>
            <Icon as={FiChevronRight} />
          </HStack>
        </Box>
        <Divider />

        <HStack py="1rem" justify="space-between">
          <Text>Admin feature 1</Text>
          <Icon as={FiChevronRight} />
        </HStack>
        <Divider />
        <HStack py="1rem" justify="space-between">
          <Text>Admin feature 2</Text>
          <Icon as={FiChevronRight} />
        </HStack>
        <Divider />
        <HStack py="1rem" justify="space-between">
          <Text>Admin feature 3</Text>
          <Icon as={FiChevronRight} />
        </HStack>
        <Divider />
      </VStack>
    </VStack>
  );
}

export default AdminHomeCard;
