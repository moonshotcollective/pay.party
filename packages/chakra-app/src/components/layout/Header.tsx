import { Box, Flex, Stack } from "@chakra-ui/react";
import React from "react";
import ConnectButton from "../Buttons/ConnectButton";

import ThemeToggle from "./ThemeToggle";

const Header = () => {
  return (
    <Flex as="header" width="full" align="center">
      <Box marginLeft="auto">
        <Stack direction="row" spacing={6}>
          <ThemeToggle />
          <ConnectButton />
        </Stack>
      </Box>
    </Flex>
  );
};

export default Header;
