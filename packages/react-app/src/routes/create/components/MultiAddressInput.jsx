import Blockie from "../../../components/Blockie";

import { Box, Textarea, HStack, Text, Tag, TagLabel, Spacer, TagCloseButton, Wrap, Spinner } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useColorModeValue } from "@chakra-ui/color-mode";

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
  const { ensProvider, value, onChange } = props;
  const [isLoading, setIsLoading] = useState(false);

  const addressBadge = d => {
    return (
      <Box p="1" key={d.input}>
        <HStack spacing={4}>
          <Tag size="md" key="md" borderRadius="full" variant="solid">
            <Box p="1">
              <Blockie address={d.address} size={5} scale={3} />
            </Box>
            <TagLabel color={d.isValid ? "default" : "red.300"}>{d.input}</TagLabel>
            <TagCloseButton
              onClick={e => {
                onChange(value.filter(obj => obj.input !== d.input));
              }}
            />
          </Tag>
        </HStack>
      </Box>
    );
  };

  const handleChange = e => {
    const lastInput = e.target.value[e.target.value.length - 1];
    if (lastInput === "," || lastInput === "\n") {
        const splitInput = e.currentTarget.value
          .split(/[ ,\n]+/)
          .filter(c => c !== "")
          .map(async uin => {
            // Data model
            let val = { input: uin, isValid: null, address: null, ens: null };
            try {
              if (uin.endsWith(".eth") || uin.endsWith(".xyz")) {
                val.address = await ensProvider.resolveName(uin);
                val.ens = uin;
              } else {
                val.ens = await ensProvider.lookupAddress(uin);
                val.address = uin;
              }
              val.isValid = true;
            } catch {
              val.isValid = false;
              console.log("Bad Address: " + uin);
            }
            return val;
          });
        setIsLoading(true);
        Promise.all(splitInput)
          .then(d => {
            onChange([...value, ...d]);
          })
          .finally(_ => setIsLoading(false));
        e.target.value = "";
    }
  };

  return (
    <Box bg={useColorModeValue("whiteAlpha.900", "purple.900")} borderRadius={24} p={6}>
      <Wrap>{value && value.map(addressBadge)}</Wrap>
      <Textarea
        resize="none"
        variant="unstyled"
        size="lg"
        rows="1"
        placeholder={props.placeholder}
        onChange={handleChange}
      />
      <HStack>
        <Spacer />
        {isLoading ? <Spinner size="sm" /> : <Text color="gray">{`Count: ${value.length}`}</Text>}
      </HStack>
    </Box>
  );
}
