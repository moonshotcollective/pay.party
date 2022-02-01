require("dotenv").config();
import "antd/dist/antd.css";
import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Switch, useHistory } from "react-router-dom";
import "./App.css";
import { Account, Contract, Header } from "./components";
import Footer from "./components/layout/Footer";
import { BLOCKNATIVE_DAPPID, INFURA_ID, NETWORKS } from "./constants";
import { Transactor, SafeTransactor } from "./helpers";
import { useBalance, useGasPrice } from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import { Home, Create, Party } from "./routes";
import { useUserProviderAndSigner } from "./hooks";

import { useContractConfig, useContractLoader } from "./hooks";

import {
  Box,
  Spacer,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  Button,
  MenuItemOption,
  MenuOptionGroup,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import NotConnectedCard from "./components/Cards/NotConnectedCard";
import CenteredFrame from "./components/layout/CenteredFrame";
import { useColorMode } from "@chakra-ui/color-mode";
import { MoonIcon, SunIcon, ChevronDownIcon } from "@chakra-ui/icons";

import Onboard from "bnc-onboard";
import { EthersAdapter } from "@gnosis.pm/safe-core-sdk";
const { ethers } = require("ethers");

// let targetNetwork = NETWORKS[process.env.REACT_APP_NETWORK_NAME]; //rinkeby; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

const DEBUG = false;
const NETWORKCHECK = true;

// Add more networks as the dapp expands to more networks
const configuredNetworks = ["mainnet", "goerli", "rinkeby", "matic"]; //still needs optimism
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  configuredNetworks.push("localhost");
}

const cachedNetwork = window.localStorage.getItem("network");
if (DEBUG) console.log("📡 Connecting to New Cached Network: ", cachedNetwork);
let targetNetwork = NETWORKS[cachedNetwork || process.env.REACT_APP_NETWORK_NAME];

// 🛰 providers

if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");

const scaffoldEthProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://rpc.scaffoldeth.io:48544")
  : null;
const poktMainnetProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider(
      "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
    )
  : null;
const mainnetInfura = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)
  : null;
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID

// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = targetNetwork.rpcUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrlFromEnv);

// 🔭 block explorer URL
export const blockExplorer = targetNetwork.blockExplorer;

function App(props) {
  const mainnetProvider =
    poktMainnetProvider && poktMainnetProvider._isProvider
      ? poktMainnetProvider
      : scaffoldEthProvider && scaffoldEthProvider._network
      ? scaffoldEthProvider
      : mainnetInfura;

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider);
  const userSigner = userProviderAndSigner.signer;

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  const contractConfig = useContractConfig();

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);

  const { colorMode, toggleColorMode } = useColorMode();

  const switchNetwork = e => {
    let value = e.target.innerText;
    if (targetNetwork.chainId !== NETWORKS[value].chainId) {
      window.localStorage.setItem("network", value);
      setTimeout(async () => {
        targetNetwork = NETWORKS[value];
        const ethereum = window.ethereum;
        const data = [
          {
            chainId: "0x" + targetNetwork.chainId.toString(16),
            chainName: targetNetwork.name,
            nativeCurrency: targetNetwork.nativeCurrency,
            rpcUrls: [targetNetwork.rpcUrl],
            blockExplorerUrls: [targetNetwork.blockExplorer],
          },
        ];
        console.log("data", data);
        // try to add new chain
        try {
          await ethereum.request({ method: "wallet_addEthereumChain", params: data });
        } catch (error) {
          // if failed, try a network switch instead
          await ethereum
            .request({
              method: "wallet_switchEthereumChain",
              params: [
                {
                  chainId: "0x" + targetNetwork.chainId.toString(16),
                },
              ],
            })
            .catch();
          if (tx) {
            console.log(tx);
          }
        }
        window.location.reload();
      }, 1000);
    }
  };

  const options = [];
  for (const id in NETWORKS) {
    if (configuredNetworks.indexOf(id) > -1) {
      options.push(
        <MenuItemOption type="radio" key={id} value={NETWORKS[id].name} onClick={switchNetwork}>
          {NETWORKS[id].name}
        </MenuItemOption>,
      );
    }
  }

  const networkSelect = (
    <Menu closeOnSelect={false}>
      <MenuButton as={Button} variant="ghost">
        <Text fontSize="sm">
          {targetNetwork.name}
          <ChevronDownIcon />
        </Text>
      </MenuButton>
      <MenuList>
        <MenuOptionGroup value={targetNetwork.name} title="select network" type="radio">
          {options}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );

  const [onboard, setOnboard] = useState(null);
  const [notify, setNotify] = useState(null);
  const [wallet, setWallet] = useState({});
  const [isSmartContract, setIsSmartContract] = useState(null);
  const [ethersAdapter, setEthersAdapter] = useState(null);
  let provider;
  useEffect(async () => {
    const onboard = Onboard({
      networkId: 5,
      dappId: BLOCKNATIVE_DAPPID,
      walletSelect: {
        wallets: [
          { walletName: "walletConnect", infuraKey: INFURA_ID },
          { walletName: "metamask" },
          { walletName: "gnosis" },
          { walletName: "tally" },
          { walletName: "frame"}
        ],
      },
      subscriptions: {
        address: setAddress,
        wallet: wallet => {
          if (wallet.provider) {
            setWallet(wallet);

            provider = new ethers.providers.Web3Provider(wallet.provider, "any");
            setInjectedProvider(provider);

            provider.on("chainChanged", chainId => {
              console.log(`chain changed to ${chainId}! updating providers`);
              setInjectedProvider(new ethers.providers.Web3Provider(provider, "any"));
            });

            provider.on("accountsChanged", () => {
              console.log(`account changed!`);
              setInjectedProvider(new ethers.providers.Web3Provider(provider, "any"));
            });

            // Subscribe to session disconnection
            provider.on("disconnect", (code, reason) => {
              console.log(code, reason);
              // logoutOfWeb3Modal();
            });

            const adapter = new EthersAdapter({
              ethers,
              signer: provider.getSigner(0),
            });

            setEthersAdapter(adapter);

            window.localStorage.setItem("selectedWallet", wallet.name);
          } else {
            provider = null;
            setWallet({});
          }
        },
      },
    });
    setOnboard(onboard);
  }, []);

  useEffect(() => {
    const previouslySelectedWallet = window.localStorage.getItem("selectedWallet");

    if (previouslySelectedWallet && onboard) {
      onboard.walletSelect(previouslySelectedWallet);
    }
  }, [onboard]);

  useEffect(async () => {
    const bytecode = address && injectedProvider && (await injectedProvider.getCode(address));
    setIsSmartContract(bytecode && bytecode !== "0x");
  }, [address, injectedProvider]);

  // The transactor wraps transactions and provides notificiations
  const tx = isSmartContract ? SafeTransactor(userSigner, gasPrice) : Transactor(userSigner, gasPrice);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  const history = useHistory();

  const [lb, setLb] = useState(yourLocalBalance);
  useEffect(() => {
    setLb(yourLocalBalance);
  }, [yourLocalBalance]);

  return (
    <div>
      <Box mb={8} pl={"14vw"} pr={"14vw"}>
        <Wrap pb={"6vh"}>
          <WrapItem>
            <a href="/">
              <Header />
            </a>
          </WrapItem>
          <Spacer />
          <WrapItem>
            <Box pt={5}>{networkSelect}</Box>
            <Box pt={5}>
              <Account
                address={address}
                localProvider={localProvider}
                userSigner={userSigner}
                mainnetProvider={mainnetProvider}
                price={price}
                web3Modal={onboard} //{web3Modal}
                loadWeb3Modal={onboard && onboard.walletSelect} //{loadWeb3Modal}
                logoutOfWeb3Modal={onboard && onboard.walletReset} //{logoutOfWeb3Modal}
                blockExplorer={blockExplorer}
              />
            </Box>
            <Box pt={5}>
              <IconButton
                variant="ghost"
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
              />
            </Box>
          </WrapItem>
        </Wrap>
        {address && address !== "" ? (
          <BrowserRouter>
            <Switch>
              <Route exact path="/">
                <Home
                  address={address}
                  tx={tx}
                  targetNetwork={targetNetwork}
                  readContracts={readContracts}
                  writeContracts={writeContracts}
                  mainnetProvider={mainnetProvider}
                />
              </Route>
              <Route path="/create">
                <Create
                  address={address}
                  userSigner={userSigner}
                  mainnetProvider={mainnetProvider}
                  localProvider={localProvider}
                  yourLocalBalance={yourLocalBalance}
                  price={price}
                  tx={tx}
                  targetNetwork={targetNetwork}
                  writeContracts={writeContracts}
                  readContracts={readContracts}
                />
              </Route>
              <Route path="/party/:id">
                <Party
                  address={address}
                  userSigner={userSigner}
                  targetNetwork={targetNetwork}
                  mainnetProvider={mainnetProvider}
                  localProvider={localProvider}
                  yourLocalBalance={lb}
                  price={price}
                  tx={tx}
                  writeContracts={writeContracts}
                  readContracts={readContracts}
                  isSmartContract={isSmartContract}
                />
              </Route>
              <Route exact path="/debug">
                <Contract
                  name="Diplomat"
                  signer={userSigner}
                  provider={localProvider}
                  address={address}
                  blockExplorer={blockExplorer}
                  contractConfig={contractConfig}
                />
              </Route>
            </Switch>
          </BrowserRouter>
        ) : (
          <CenteredFrame>
            <NotConnectedCard />
          </CenteredFrame>
        )}
        <Footer />
      </Box>
    </div>
  );
}

export default App;
