import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import React from "react";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import { ChakraProvider } from "@chakra-ui/react";
import { CacheProvider } from "@emotion/react";
import { EmotionCache } from "@emotion/cache";
import "@fontsource/space-mono";
import "@fontsource/poppins";

import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import createEmotionCache from "./styles/createEmotionCache";
import customTheme from "./styles/customTheme";

const themes = {
  dark: `${process.env.PUBLIC_URL}/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/light-theme.css`,
};

const prevTheme = window.localStorage.getItem("theme");

const subgraphUri = "http://localhost:8000/subgraphs/name/scaffold-eth/your-contract";

const client = new ApolloClient({
  uri: subgraphUri,
  cache: new InMemoryCache(),
});

const emotionCache = createEmotionCache();

ReactDOM.render(
  <ApolloProvider client={client}>
    <CacheProvider value={emotionCache}>
      <ChakraProvider theme={customTheme}>
        <ThemeSwitcherProvider themeMap={themes} defaultTheme={prevTheme || "light"}>
          <App subgraphUri={subgraphUri} />
        </ThemeSwitcherProvider>
      </ChakraProvider>
    </CacheProvider>
  </ApolloProvider>,
  document.getElementById("root"),
);
