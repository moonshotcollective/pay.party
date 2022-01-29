// import { Select } from "antd";
// import { useLookupAddress } from "eth-hooks/dapps/ens";
// import React, { useCallback, useState } from "react";
// import QrReader from "react-qr-reader";
import Blockie from "../../../components/Blockie";
import { ethers } from "ethers";
// import { useMemo } from "react";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Center,
  Text,
  Link,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  TagLeftIcon,
  Flex,
  Wrap,
  Spinner,
} from "@chakra-ui/react";
import { ArrowBackIcon, EditIcon } from "@chakra-ui/icons";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
// import { AddressChakra, Blockie } from "../../components";

// probably we need to change value={toAddress} to address={toAddress}

/*
  ~ What it does? ~
  Displays an address input with QR scan option
  ~ How can I use? ~
  <MultiAddressInput
    // autoFocus
    ensProvider={mainnetProvider}
    placeholder="Enter address"
    value={toAddress}
    onChange={setToAddress}
  />
  ~ Features ~
  - Provide ensProvider={mainnetProvider} and your address will be replaced by ENS name
              (ex. "0xa870" => "user.eth") or you can enter directly ENS name instead of address
  - Provide placeholder="Enter address" value for the input
  - Value of the address input is stored in value={toAddress}
  - Control input change by onChange={setToAddress}
                          or onChange={address => { setToAddress(address);}}
*/

export default function MultiAddressInput(props) {
  const { ensProvider, onChange, defaultValue } = props;
  const [input, setInput] = useState([]);
  const [voters, setVoters] = useState([]);

  useEffect(() => {
    input.map(async uin => {
      if (voters.some(d => d.input === uin)) {
        //
      } else {
        const voter = { input: uin, isValid: null, address: null, ens: null };
        try {
          if (uin.endsWith(".eth") || uin.endsWith(".xyz")) {
            voter.address = await ensProvider.resolveName(uin);
            voter.ens = uin;
          } else {
            voter.ens = await ensProvider.lookupAddress(uin);
            voter.address = uin;
          }
          voter.isValid = true;
        } catch {
          voter.isValid = false;
        }
        setVoters([...voters, voter]);
      }
    });
  }, [input]);

  useEffect(() => {
    onChange(voters);
  }, [voters]);

  const fun = d => {
    const voter = voters.filter(v => v.input === d)[0];
    return (
      <Box p="1" key={d}>
        <HStack spacing={4}>
          <Tag size="md" key="md" borderRadius="full" variant="solid">
            <Box p="1">{voter ? <Blockie address={voter.address} size={5} scale={3} /> : <Spinner size="xs" />}</Box>
            <TagLabel>{d}</TagLabel>
            <TagCloseButton
              onClick={e => {
                setInput(input.filter(adr => adr !== d));
                setVoters(voters.filter(obj => obj.input !== d));
              }}
            />
          </Tag>
        </HStack>
      </Box>
    );
  };

  return (
    <Box bg="whiteAlpha.800" borderRadius={24} p={6}>
      <Wrap>{input.map(fun)}</Wrap>
      <Textarea
        variant="unstyled"
        size="lg"
        rows="1"
        placeholder={props.placeholder}
        onChange={e => {
          const lastInput = e.target.value[e.target.value.length - 1];
          if (lastInput === "," || lastInput === "\n") {
            if (defaultValue && defaultValue.length > 0) {
              setInput(defaultValue);
              // e.target.value = "";
            } else {
              const splitInput = e.currentTarget.value.split(/[ ,\n]+/).filter(c => c !== "");
              setInput([...input, ...splitInput]);
              e.target.value = "";
            }
          }
        }}
      />
    </Box>
  );
}
