import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import React from "react";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { CacheProvider } from "@emotion/react";
import { EmotionCache } from "@emotion/cache";
import "@fontsource/space-mono";
import "@fontsource/inter";
import "@fontsource/poppins";
import { mode } from "@chakra-ui/theme-tools";

import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import createEmotionCache from "./styles/createEmotionCache";
import { colorModeConfig, theme } from "./styles/customTheme";
import { Web3Provider } from "./helpers/Web3Context";
import { extendTheme, withDefaultColorScheme } from "@chakra-ui/react";
import SafeProvider from '@gnosis.pm/safe-apps-react-sdk';

ReactDOM.render(
  <>
    <ColorModeScript initialColorMode={colorModeConfig.initialColorMode} />
    <ChakraProvider theme={theme}>
    <SafeProvider>
      <App />
      </SafeProvider>
    </ChakraProvider>
  </>,
  document.getElementById("root"),
);
