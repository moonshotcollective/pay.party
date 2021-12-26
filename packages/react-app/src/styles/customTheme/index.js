import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

import { customTheme } from "@moonshotcollective/ui";
import { StepsStyleConfig as Steps } from "chakra-ui-steps";

export const colorModeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  ...customTheme,
  config: colorModeConfig,
});
