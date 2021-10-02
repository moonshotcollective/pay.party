import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

import colors from "./colors";
import Button from "./components/button";
import fonts from "./fonts";

import { StepsStyleConfig as Steps } from "chakra-ui-steps";

const customTheme = extendTheme({
  config: {
    initialColorMode: "dark",
  },
  styles: {
    global: (props: any) => ({
      body: {
        color: mode("purple.700", "violet.300")(props),
        bg: mode("violet.50", "brand.500")(props),
      },
    }),
  },
  fonts,
  colors,
  components: {
    Button,
    Steps,
  },
});

export default customTheme;

// Name	Space	    Pixels
// px	  1px	      1px
// 0.5	0.125rem	2px
// 1	  0.25rem	  4px
// 1.5	0.375rem	6px
// 2	  0.5rem	  8px
// 2.5	0.625rem	10px
// 3	  0.75rem	  12px
// 3.5	0.875rem	14px                body-SM
// 4	  1rem	    16px    H5          body-MD
// 5	  1.25rem	  20px    H4          body-LG
// 6	  1.5rem	  24px    H3          body-XL
// 7	  1.75rem	  28px
// 8	  2rem	    32px    H2
// 9	  2.25rem	  36px
// 10	  2.5rem	  40px
// 12	  3rem	    48px    H1
// 14	  3.5rem	  56px
// 16	  4rem	    64px    Heading XL
