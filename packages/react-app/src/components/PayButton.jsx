import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { ethers } from "ethers";

const loadingStatus = [0, 2, 4];
const disabledStatus = [...loadingStatus, 5];

export default function PayButton({
  token,
  tokenAddr,
  amount = "0",
  appName,
  spender,
  style = {},
  callerAddress,
  maxApproval = "115792089237316195423570985008687907853269984665640564039457584007913129639935",
  readContracts,
  writeContracts,
  yourLocalBalance,
  tokenListHandler,
  ethPayHandler,
  tokenPayHandler,
}) {
  console.log({
    token,
    tokenAddr,
    amount,
    appName,
    spender,
    style,
    callerAddress,
    maxApproval,
    readContracts,
    writeContracts,
    yourLocalBalance,
    tokenListHandler,
    ethPayHandler,
    tokenPayHandler,
  });
  const [tokenInfo, setTokenInfo] = useState({});
  const [status, setStatus] = useState(0); // loading | lowAllowance | approving | ready | distributing | noBalance

  const refreshETH = () => {
    console.log(yourLocalBalance.toString(), ethers.utils.parseEther(amount).toString());
    // let ylb = yourLocalBalance.gte(ethers.utils.parseEther(amount || "0")) ? 3 : 5;

    setStatus(3);
  };

  const refreshTokenDetails = async () => {
    console.log(readContracts);
    if (!readContracts[token]) {
      console.log("cannot read token", token);
      return;
    }
    const decimals = await readContracts[token].decimals();
    // console.log(callerAddress, spender);
    const allowance = await readContracts[token].allowance(callerAddress, spender);
    const balance = await readContracts[token].balanceOf(callerAddress);
    const address = readContracts[token].address;

    const adjustedAmount = ethers.utils.parseUnits(amount || "0", decimals);
    const hasEnoughAllowance = allowance.lt(adjustedAmount);

    setTokenInfo({ ...tokenInfo, [token]: { decimals, allowance, address, balance } });
    if (balance.isZero()) {
      setStatus(5);
    } else {
      if (allowance.isZero() || hasEnoughAllowance) {
        setStatus(1);
      } else {
        setStatus(3);
      }
    }
  };

  const approveTokenAllowance = async () => {
    setStatus(2);
    const newAllowance = ethers.utils.parseUnits(maxApproval, tokenInfo[token].decimals);

    const res = await writeContracts[token].approve(spender, newAllowance);
    await res.wait(1);
    await refreshTokenDetails();
  };

  const isETH = () => {
    if (!token) return "ETH";
    return token.toUpperCase() === "ETH";
  };

  const isMATIC = () => {
    if (!token) return "MATIC";
    return token.toUpperCase() === "MATIC";
  };

  const handlePay = async () => {
    const payParams = { token, ...tokenInfo[token] };
    console.log("handlePay ", isETH());
    if (isETH()) {
      setStatus(4);
      ethPayHandler()
        .then(success => {
          console.log(success);
          setStatus(3);
        })
        .catch(err => {
          console.log(err);
          setStatus(3);
        });
    } else {
      if (status === 1) {
        setStatus(3);
        await approveTokenAllowance();
        setStatus(4);
      } else {
        setStatus(1);
        await tokenPayHandler(payParams);
        await refreshTokenDetails();
        setStatus(4);
      }
    }
  };

  useEffect(() => {
    if (isETH()) {
      //   refreshETH();
    } else if (tokenInfo[token]) {
      const adjustedAmount = ethers.utils.parseUnits(amount || "0", tokenInfo[token].decimals);
      const hasEnoughAllowance = tokenInfo[token].allowance.lt(adjustedAmount);
      const hasEnoughBalance = tokenInfo[token].balance.gte(adjustedAmount);
      setStatus(hasEnoughBalance ? (hasEnoughAllowance ? 1 : 3) : 5);
    }
  }, [amount]);

  useEffect(() => {
    console.log(token);
    if (!isETH() && !isMATIC()) {
      setStatus(0);
      refreshTokenDetails();
    } else if (isMATIC()) {
      refreshETH();
    } else {
      refreshETH();
    }
  }, [token]);

  useEffect(() => {
    // const erc20List = Object.keys(readContracts).reduce((acc, contract) => {
    //   if (typeof readContracts[contract].decimals !== "undefined") {
    //     acc.push(contract);
    //   }
    //   return acc;
    // }, []);
    // if (tokenListHandler && (typeof tokenListHandler).toLowerCase() === "function") {
    //   tokenListHandler(erc20List);
    // }
  }, [readContracts]);

  const renderButtonText = () => {
    let text = "Loading...";

    console.log({ status });
    switch (status) {
      case 1:
        text = `Approve ${appName} to transfer ${token}`;
        break;
      case 2:
        text = `Approving ${token}...`;
        break;
      case 3:
        text = `💸 Distribute ${token}`;
        break;
      case 4:
        text = `Distributing ${token}...`;
        break;
      case 5:
        text = `Not enough ${token}`;
        break;
      default:
        text = "Loading...";
        break;
    }

    return text;
  };

  return (
    <Button
      disabled={disabledStatus.indexOf(status) >= 0 || !(amount > 0)}
      loading={loadingStatus.indexOf(status) >= 0}
      style={style}
      type="danger"
      shape="round"
      size="large"
      onClick={handlePay}
    >
      {renderButtonText()}
    </Button>
  );
}
