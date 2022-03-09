import { useColorModeValue } from "@chakra-ui/color-mode";
import { QuestionOutlineIcon } from "@chakra-ui/icons";
import { Box, Button, Center, HStack, Text, Tooltip, Spacer, Radio, RadioGroup, Stack } from "@chakra-ui/react";
import { InputNumber } from "antd";
import { BigNumber, ethers, utils } from "ethers";
import React, { useState } from "react";
import { toWei } from "web3-utils";
import TokenSelect from "./TokenSelect";

export const Distribute = ({
  partyData,
  address,
  userSigner,
  readContracts,
  writeContracts,
  tx,
  distribution,
  setDistribution,
  strategy,
  setStrategy,
  isSmartContract,
  localProvider,
  setAmountToDistribute,
  targetNetwork,
}) => {
  const [tokenInstance, setTokenInstance] = useState(null);
  const [amounts, setAmounts] = useState(null);
  const [total, setTotal] = useState();
  const [isDistributionLoading, setIsDistributionLoading] = useState(false);
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const [isApprovalLoading, setIsApprovalLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [hasApprovedAllowance, setHasApprovedAllowance] = useState(false);
  const [addresses, setAddresses] = useState([]);

  const handleApproval = res => {
    if (res && (res.status === "confirmed" || res.status === 1)) {
      console.log(" 🍾 Transaction " + res.hash + " finished!");
      setHasApprovedAllowance(true);
      setIsApprovalLoading(false);
    } else {
      setHasApprovedAllowance(false);
      setIsApprovalLoading(false);
    }
  };

  // Approve total token amount
  const approve = async () => {
    setIsApprovalLoading(true);
    const abi = [
      "function approve(address spender, uint256 amount) public returns (bool)",
      "function allowance(address owner, address spender) external view returns (uint256)",
    ];
    const erc20_rw = new ethers.Contract(token, abi, userSigner);
    const erc20_r = new ethers.Contract(token, abi, localProvider);
    const validAllowance = await erc20_r.allowance(address, readContracts.Distributor.address);
    if (validAllowance.gte(total)) {
      setHasApprovedAllowance(true);
      setIsApprovalLoading(false);
    } else {
      console.log("Not enough allowance!");
      tx(erc20_rw.approve(readContracts.Distributor.address, total), handleApproval);
    }
  };

  // Update the distrubtion amounts when input total changes
  const handleAmountChange = async e => {
    try {
      if (distribution && distribution.length > 0) {
        const validDistribution = distribution.filter(d => d.score !== 0);

        const validAdrs = [];
        const validScores = [];

        for (let i = 0; i < validDistribution.length; i++) {
          validAdrs.push(validDistribution[i].address);
          validScores.push(validDistribution[i].score);
        }

        const amt = Number(e);
        const adrs = [];
        const amts = [];
        let tot = BigNumber.from("0x00");
        for (let i = 0; i < validAdrs.length; i++) {
          let pay = (validScores[i] * amt).toFixed(16).toString();
          const x = BigNumber.from(toWei(pay));
          amts.push(x);
          adrs.push(validAdrs[i]);
          tot = tot.add(x);
        }
        setTotal(tot);
        setAmounts(amts);
        setAddresses(adrs);
        const len = partyData.receipts.length;
        if (len > 0) {
          amt > 0
            ? setAmountToDistribute(amt)
            : setAmountToDistribute(utils.formatEther(partyData.receipts[len - 1].amount));
        } else {
          amt > 0 ? setAmountToDistribute(amt) : setAmountToDistribute(0);
        }
        setHasApprovedAllowance(false);
      }
    } catch {
      // Do something
    }
  };

  const handleReceipt = async res => {
    if (res && res.hash && (res.status === "confirmed" || res.status === 1)) {
      console.log(" 🍾 Transaction " + res.hash + " finished!");
      const receipt = {
        account: address,
        amount: total.toHexString(),
        token: tokenInstance?.address,
        txn: res.hash,
        strategy: strategy,
        chainId: targetNetwork.chainId,
        
      };
      await fetch(`${process.env.REACT_APP_API_URL}/party/${partyData.id}/distribute`, {
        method: "put",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(receipt),
      });
    }
    setIsDistributionLoading(false);
    //window.location.reload(false);
  };

  // const handleSafeReceipt = res => {
  //   if (res && res.hash && (res.status === "confirmed" || res.status === 1)) {
  //     console.log(" 🍾 Transaction " + res.hash + " finished!");
  //     const receipt = {
  //       account: address,
  //       amount: total.toHexString(),
  //       token: tokenInstance?.address,
  //       txn: res.hash,
  //     };
  //   }
  //   setIsDistributionLoading(false);
  // };

  // Distribute either Eth, or loaded erc20
  const distribute = () => {
    try {
      if (partyData && partyData.ballots.length > 0) {
        setIsDistributionLoading(true);
        // Distribute the funds
        if (token && amounts && addresses && hasApprovedAllowance) {
          // Distribute Token
          tx(writeContracts.Distributor.distributeToken(token, addresses, amounts, partyData.id), handleReceipt);
        } else {
          if (amounts) {
            // Distribute Ether
            tx(
              writeContracts.Distributor.distributeEther(addresses, amounts, partyData.id, { value: total }),
              handleReceipt,
            );
          } else {
            setIsDistributionLoading(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
      setIsDistributionLoading(false);
    }
  };

  const DistributeButton = () => {
    return (
      <>
        {token && !hasApprovedAllowance ? (
          <Box p="2">
            <Button onClick={approve} isLoading={isApprovalLoading}>
              Approve
            </Button>
          </Box>
        ) : (
          <Box p="2">
            <Button onClick={distribute} isLoading={isDistributionLoading}>
              Distribute
            </Button>
          </Box>
        )}
      </>
    );
  };

  //   const { sdk, connected, safe } = useSafeAppsSDK();
  // useEffect(
  //   console.log(sdk, connected, safe)

  //   const txs = [
  //     {
  //       to: address,
  //       value: '0',
  //       data: '0xbaddad',
  //     },
  //     //...
  //   ];
  //   // Returns a hash to identify the Safe transaction
  //   const safeTxHash = await sdk.txs.send({ txs });
  // }, [])\

  const [strat, setStrat] = useState();

  return (
    <Box>
      <Center>
        <Box p="6" bg={useColorModeValue("whiteAlpha.900", "purple.900")} borderRadius={24} w="calc(65%)">
          <HStack>
            <Text fontSize="lg">Distribute Funds</Text>
            <Spacer />
            <Tooltip label="Anyone can distribute at any time using their selected distribution strategy. Any ERC-20 Contract is supported.">
              <QuestionOutlineIcon w={4} h={4} />
            </Tooltip>
          </HStack>
          <Box p="2">
            <Text>Select Strategy</Text>
            <RadioGroup onChange={setStrategy} value={strategy} p={3} size="sm">
              <Stack>
                <Radio value="quadratic">Quadratic</Radio>
                <Radio value="linear">Linear</Radio>
              </Stack>
            </RadioGroup>
            <Text>Amount</Text>
            <InputNumber
              size="large"
              min={0}
              placeholder={0.0}
              step="0.1"
              onChange={handleAmountChange}
              bordered={false}
              style={{ width: "calc(100%)", color: useColorModeValue("black", "lightgray") }}
            ></InputNumber>
          </Box>
          <Box p="2">
            <Text>Select a Token (optional)</Text>
            <TokenSelect
              chainId={userSigner?.provider?._network?.chainId}
              onChange={setToken}
              localProvider={localProvider}
              nativeToken={{ name: "Ethereum", symbol: "ETH" }}
              style={{ color: useColorModeValue("black", "lightgray"), width: "calc(100%)" }}
            />
          </Box>
          <Center p="2">
            <DistributeButton />
          </Center>
        </Box>
      </Center>
    </Box>
  );
};
