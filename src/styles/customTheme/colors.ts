import { DeepPartial, Theme } from "@chakra-ui/react";

/** extend additional color here */
const extendedColors: DeepPartial<
  Record<string, Theme["colors"]["blackAlpha"]>
> = {
  yellow: {
    100: "#fc0",
    200: "#fc0",
    300: "#fc0",
    400: "#fc0",
    500: "#fc0",
    600: "#fc0",
    700: "#fc0",
    800: "#fc0",
    900: "#fc0",
  },
  violet: {
    100: "#6f3ff5",
    200: "#6f3ff5",
    300: "#6f3ff5",
    400: "#6f3ff5",
    500: "#6f3ff5",
    600: "#6f3ff5",
    700: "#6f3ff5",
    800: "#6f3ff5",
    900: "#6f3ff5",
  },
};

/** override chakra colors here */
const overridenChakraColors: DeepPartial<Theme["colors"]> = {};

const colors = {
  ...overridenChakraColors,
  ...extendedColors,
};

export default colors;
