import { DeepPartial, Theme } from "@chakra-ui/react";

/** extend additional color here */
const extendedColors = {
  brand: {
    100: "#10033a",
    200: "#0f0335",
    300: "#0d0231",
    400: "#0c022c",
    500: "#0b0228",
    600: "#090222",
    700: "#08011d",
    800: "#070118",
    900: "#050113",
  },
  yellow: {
    100: "#ffd83d",
    200: "#ffd52e",
    300: "#ffd21f",
    400: "#ffcf0f",
    500: "#fc0",
    600: "#f0c000",
    700: "#e6b800",
    800: "#dbaf00",
    900: "#d1a700",
  },
  purple: {
    100: "#9672f8",
    200: "#8e69f7",
    300: "#7c50f6",
    400: "#7547f5",
    500: "#6f3ff5",
    600: "#6633f4",
    700: "#5820f3",
    800: "#5016f3",
    900: "#490df2",
  },
  violet: {
    50: "#FAF5FF",
    100: "#E9D8FD",
    200: "#D6BCFA",
    300: "#c9b8ff",
    400: "#bfaef4",
    500: "#ad98f1",
    600: "#a993f0",
    700: "#a68ff0",
    800: "#a28aef",
    900: "#9e86ef",
  },
};

/** override chakra colors here */
const overridenChakraColors = {};

const colors = {
  ...overridenChakraColors,
  ...extendedColors,
};

export default colors;
