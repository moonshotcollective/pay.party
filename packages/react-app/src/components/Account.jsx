import React from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { Box, Button } from "@chakra-ui/react";
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
  const lookup = useLookupAddress(mainnetProvider, address);
  const ensSplit = lookup?.split(".");
  const validEnsCheck = ensSplit && ensSplit[ensSplit.length - 1] === "eth";

  let displayAddress = "Loading...";

  if (validEnsCheck) {
    displayAddress = lookup;
  } else {
    displayAddress =
      address !== undefined
        ? `${address.substr(0, 5)}...${address.substr(address.length - 6, address.length)}`
        : "Loading...";
  }

  const modalButtons = [];
  if (web3Modal) {
    if (web3Modal.cachedProvider || web3Modal.provider.safe) {
      modalButtons.push(
        <Button key="logoutbutton" size="md" variant="outline" onClick={logoutOfWeb3Modal}>
          🟢 {displayAddress}
        </Button>,
      );
    } else {
      modalButtons.push(
        <Button key="loginbutton" size="md" onClick={loadWeb3Modal}>
          connect
        </Button>,
      );
    }
  }

  return <Box>{modalButtons}</Box>;
}
