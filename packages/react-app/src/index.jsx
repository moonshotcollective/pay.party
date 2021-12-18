import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import React from "react";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { CacheProvider } from "@emotion/react";
import { EmotionCache } from "@emotion/cache";
import "@fontsource/space-mono";
import "@fontsource/poppins";
import { mode } from '@chakra-ui/theme-tools';

import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import createEmotionCache from "./styles/createEmotionCache";
// import customTheme from "./styles/customTheme";
import { Web3Provider } from "./helpers/Web3Context";
import { extendTheme, withDefaultColorScheme } from "@chakra-ui/react";

////

const baseCols = {
  50: "#ece7fe",
  100: "#c7b7f6",
  200: "#a187f2",
  300: "#7c57f0",
  400: "#5929ec",
  500: "#4113d3",
  600: "#330ea3",
  700: "#240a74",
  800: "#150546",
  900: "#070118",
};
///
// 2. Add your color mode config
const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const styles = {
  global: props => ({
    body: {
      color: mode('gray.800', 'whiteAlpha.900')(props),
      bg: mode('whiteAlpha.900', "#1b0f40")(props),
    },
  }),
};
const customTheme = extendTheme({ config, styles }); //withDefaultColorScheme({ colorScheme: 'purple' }))

ReactDOM.render(
  <>
    <ColorModeScript initialColorMode={customTheme.config.initialColorMode} />,
    <ChakraProvider theme={customTheme}>
      <App />
    </ChakraProvider>
  </>,
  document.getElementById("root"),
);
