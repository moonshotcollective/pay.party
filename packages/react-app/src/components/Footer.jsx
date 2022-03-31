import { Flex, HStack, Link, Text, Box, useColorModeValue, Spacer, Center } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/icon";
import { FaGithub } from "react-icons/fa";

import GitcoinIcon from "./Icons/GitcoinIcon";

const Footer = () => {
  return (
    <Box as="footer" width="100%" alignContent="center" pt={10}>
      <HStack>
        <Link href="https://github.com/moonshotcollective" isExternal>
          <Icon
            as={FaGithub}
            w={6}
            h={6}
            color="purple.500"
            _hover={{
              color: "yellow.500",
            }}
          />
        </Link>
        <Text fontSize={"xs"}>v1.5-alpha0</Text>
        <Spacer />
        <GitcoinIcon />
        <Link href="https://moonshotcollective.space/" isExternal>
          Gitcoin - Moonshot Collective
        </Link>
      </HStack>
    </Box>
  );
};

export default Footer;