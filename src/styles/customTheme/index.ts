import { extendTheme } from "@chakra-ui/react";

import colors from "./colors";
import Button from "./components/button";
import fonts from "./fonts";

const customTheme = extendTheme({
  styles: {
    global: {
      body: {
        fontFamily: "Space Mono",
        backgroundColor: "#0b0228",
        color: "#c9b8ff"
      },
    },
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
