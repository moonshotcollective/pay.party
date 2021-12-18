import { Flex, HStack, Link, Text, Box, useColorModeValue, Spacer} from "@chakra-ui/react";
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
          <Spacer />
          <GitcoinIcon />
          <Link href="https://moonshotcollective.space/" isExternal>
              Moonshot Collective
            </Link>
        </HStack>
      {/* <HStack alignItems="center" justifyContent="space-between" width="full">
        <Flex alignItems="bottom" justifyContent="bottom">
          <GitcoinIcon />
          <Text ml="2">
            <Link href="https://moonshotcollective.space/" isExternal>
              Built with 💜 by the Gitcoin community | Moonshot Collective
            </Link>
          </Text>
        </Flex>
        <Link href="https://github.com/moonshotcollective" isExternal>
          <Icon
            as={FaGithub}
            w={35}
            h={35}
            color="purple.500"
            _hover={{
              color: "yellow.500",
            }}
          />
        </Link>
      </HStack> */}
    </Box>
  );
};

export default Footer;
