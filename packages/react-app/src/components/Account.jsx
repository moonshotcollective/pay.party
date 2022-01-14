import React from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { Box, Button, Icon } from "@chakra-ui/react";
import { useLookupAddress } from "eth-hooks/dapps/ens";

export default function Account({
  address,
  userSigner,
  localProvider,
  mainnetProvider,
  price,
  minimized,
  web3Modal,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  blockExplorer,
}) {
  // console.log(address)
  const lookup = useLookupAddress(mainnetProvider, address);
  const ensSplit = lookup?.split(".");
  const validEnsCheck = ensSplit && ensSplit[ensSplit.length - 1] === "eth";

  let displayAddress = "Loading...";

  if (validEnsCheck) {
    displayAddress = lookup;
  } else {
    displayAddress =
      address !== undefined
        ? `${address.substr(0, 6)}...${address.substr(address.length - 4, address.length)}`
        : "Loading...";
  }

  const modalButtons = [];
  if (web3Modal) {
    if (address) {//web3Modal?.cachedProvider || web3Modal?.provider?.safe) {
      modalButtons.push(
        <Button key="logoutbutton" size="md" variant="outline" onClick={web3Modal.walletReset}>
          <Icon viewBox="10 -22 144 144">
            <svg height="100" width="100">
              <circle cx="50" cy="50" r="40" fill="#50C878" />
            </svg>
          </Icon>
          {displayAddress}
        </Button>,
      );
    } else {
      modalButtons.push(
        <Button key="loginbutton" size="md" onClick={async () => {
            await web3Modal.walletSelect()
            await web3Modal.walletCheck()
          
          }}>
          connect
        </Button>,
      );
    }
  }

  return <Box>{modalButtons}</Box>;
}
