import { Flex, Link, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Flex as="footer" width="full" align="center">
      <Text>
        {new Date().getFullYear()} -{" "}
        <Link href="https://sznm.dev" isExternal>
        Built by the Gitcoin community
        </Link>
      </Text>
    </Flex>
  );
};

export default Footer;
