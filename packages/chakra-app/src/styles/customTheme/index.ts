import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

import colors from "./colors";
import Button from "./components/button";
import fonts from "./fonts";

const customTheme = extendTheme({
  config: {
    initialColorMode: "dark",
  },
  styles: {
    global: (props: any) => ({
      body: {
        color: mode("brand.900", "violet.500")(props),
        bg: mode("violet.50", "brand.500")(props),
      },
    }),
  },
  fonts,
  colors,
  components: {
    Button,
  },
});

export default customTheme;

// violet #6f3ff5
// light violet #c9b8ff
// yellow #fc0
// dark violet #0b0228
