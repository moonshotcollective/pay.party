import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Divider,
  Button,
  Input,
  InputRightElement,
  InputGroup,
  Icon,
} from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";
import QRCodeIcon from "../../Icons/QRCodeIcon";
import { FiX } from "react-icons/fi";

function AddMembersCard() {
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

  const members = ["0xad", "0xad", "0xad", "0xad", "0xad", "0xad"];

  return (
    <VStack align="left" w="100%" spacing="0.5rem">
      <Heading fontSize="1.5rem" color={headingColor}>
        Add members to election
      </Heading>
      <VStack w="100%" align="left" spacing="1.5rem">
        <HStack pt="2rem" justify="space-between">
          <Text fontSize="1rem">
            Vote Allocation
            <br /> Number of votes for each voter
          </Text>
          <Box w="5rem">
            <Input
              borderColor="purple.500"
              textAlign="center"
              readOnly
              placeholder="4"
            />
          </Box>
        </HStack>
        <Divider />
        <Text fontSize="1rem">Add Voters</Text>
        {members.map((member, i) => (
          <>
            <HStack justify="space-between">
              <Text>Voter {i}</Text>
              <HStack>
                <InputGroup w="300px">
                  <Input
                    borderColor="purple.500"
                    color="purple.500"
                    placeholder="Enter Address"
                  />
                  <InputRightElement p="2.5" children={<QRCodeIcon />} />
                </InputGroup>
                <Icon color="red.500" as={FiX} />
              </HStack>
            </HStack>
          </>
        ))}
        <Button w="100%" variant="outline">
          + Add voter
        </Button>
        <Divider />
        <Button alignSelf="end">Submit</Button>
      </VStack>
    </VStack>
  );
}

export default AddMembersCard;
