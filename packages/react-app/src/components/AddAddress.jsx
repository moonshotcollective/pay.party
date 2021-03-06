import { CameraOutlined, QrcodeOutlined } from "@ant-design/icons";
import { Badge, Input } from "antd";
import React, { useCallback, useState } from "react";
import QrReader from "react-qr-reader";
import Blockie from "./Blockie";

// probably we need to change value={toAddress} to address={toAddress}

/*
  ~ What it does? ~

  Displays an address input with QR scan option

  ~ How can I use? ~

  <AddressInput
    autoFocus
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

export default function AddAddress(props) {
  const [value, setValue] = useState(props.value);

  const currentValue = typeof props.value !== "undefined" ? props.value : value;

  const { ensProvider, onChange } = props;
  const updateAddress = useCallback(
    async newValue => {
      if (typeof newValue !== "undefined") {
        let address = newValue;
        if (address.indexOf(".eth") > 0 || address.indexOf(".xyz") > 0) {
          try {
            const possibleAddress = await ensProvider.resolveName(address);
            if (possibleAddress) {
              address = possibleAddress;
            }
            // eslint-disable-next-line no-empty
          } catch (e) {}
        }
        setValue(address);
        if (typeof onChange === "function") {
          onChange(address);
        }
      }
    },
    [ensProvider, onChange],
  );

  return (
    <div>
      <Input
        size="large"
        id="0xAddress" // name it something other than address for auto fill doxxing
        name="0xAddress" // name it something other than address for auto fill doxxing
        autoComplete="false"
        autoFocus={props.autoFocus}
        placeholder={props.placeholder ? props.placeholder : "address"}
        prefix={<Blockie address={currentValue} size={8} scale={3} />}
        value={currentValue}
        style={{ width: "30em" }}
        onChange={e => {
          updateAddress(e.target.value);
        }}
        allowClear={true}
      />
    </div>
  );
}
