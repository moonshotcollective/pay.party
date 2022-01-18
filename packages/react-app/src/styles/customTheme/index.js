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

  styles: {
    global: props => ({
      body: {
        color: mode("gray.700", "whiteAlpha.900")(props),
        bg: mode("#faf5ff", "#0b0228")(props),
        lineHeight: "base",
      },
    }),
  },
  config: colorModeConfig,
});
