import { Text, Heading, VStack, Button } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";

function NotConnectedCard() {
  const headingColor = useColorModeValue("yellow.600", "yellow.500");
  return (
    <VStack align="left" w="100%" spacing="0.5rem">
      <Heading fontSize="1.5rem" color={headingColor}>
        Wallet not connected
      </Heading>
      <Text pb="2rem" fontSize="1rem">
        Please connect a wallet to continue.
      </Text>
    </VStack>
  );
}

export default NotConnectedCard;
