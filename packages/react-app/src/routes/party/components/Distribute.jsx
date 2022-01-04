import { NumberInput, NumberInputField, Box, Button, Input, HStack, Spacer } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { toWei } from "web3-utils";
import { BigNumber, ethers } from "ethers";
import $ from "jquery";

export const Distribute = ({ dbInstance, partyData, address, userSigner, writeContracts, tx }) => {
  const [tokenInstance, setTokenInstance] = useState(null);
  const [amounts, setAmounts] = useState(null);
  const [total, setTotal] = useState();
  const [distribution, setDistribution] = useState();
  const [isDistributionLoading, setIsDistributionLoading] = useState(false);
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const [isApprovalLoading, setIsApprovalLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [hasApprovedAllowance, setHasApprovedAllowance] = useState(false);
  const [addresses, setAddresses] = useState([]);

  // Calculate percent distribution from submitted ballots
  const calcDistribution = () => {
    if (partyData &&  partyData.ballots && partyData.ballots.length > 0) {
      const votes = partyData.ballots.map(b => JSON.parse(b.data.ballot.votes.replace(/[ \n\r]/g, "")));
      let sum = 0;
      let processed = [];
      let strategy = partyData.config.strategy;
      if (!strategy || strategy === "") {
        strategy = "Linear";
        console.log("Reverted to linear strategy");
      }
      for (let i = 0; i < partyData.candidates.length; i++) {
        const candidate = partyData.candidates[i];
        // Strategy handling
        // TODO: Switch statement
        if (strategy === "Linear") {
          let c = votes.reduce((total, vote) => vote[candidate] + total, 0);
          sum += c;
          processed.push({ address: candidate, reduced: c });
        } else if (strategy === "Quadratic") {
          let c = votes.reduce((total, vote) => vote[candidate] ** 0.5 + total, 0);
          sum += c;
          processed.push({ address: candidate, reduced: c });
        }
      }
      let final = [];
      for (let i = 0; i < partyData.candidates.length; i++) {
        const candidate = partyData.candidates[i];
        final.push({ address: candidate, score: processed[i].reduced / sum });
      }
      setDistribution(final);
    }
  };

  // Calculate the distribution on load
  useEffect(() => {
    calcDistribution();
  }, [partyData]);

  const handleTokenChange = e => {
    setToken(e.target.value);
  };

  // load an erc20
  // TODO: add capability for other block explorers
  const loadToken = async () => {
    setIsTokenLoading(true);
    $.getJSON(
      `https://api.etherscan.io/api?module=contract&action=getabi&address=${token}&${process.env.REACT_APP_ETHERSCAN_KEY}`,
      data => {
        if (data.status === "0") {
          setTokenInstance(null);
          setIsTokenLoading(false);
        } else if (data.status === "1") {
          const ABI = JSON.parse(data.result);
          let contractInstance = new ethers.Contract(token, ABI, userSigner);
          setTokenInstance(contractInstance);
          setIsTokenLoading(false);
        }
      },
    );
    setHasApprovedAllowance(false);
  };

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
    // setIsApprovalLoading(true);
    tx(tokenInstance?.approve(tokenInstance.address, total), handleApproval);
  };

  // Update the distrubtion amounts when input total changes
  const handleAmountChange = async e => {
    if (distribution && distribution.length > 0) {

      const validDistribution = distribution.filter(d => d.score !== 0);
      console.log(validDistribution) 
      
      const validAdrs = [];
      const validScores = []; 
  
      for (let i = 0; i < validDistribution.length; i++) {
        validAdrs.push(validDistribution[i].address)
        validScores.push(validDistribution[i].score)
      }

      const amt = Number(e);
      const adrs = [];
      const amts = [];
      let tot = BigNumber.from("0x00");
      for (let i = 0; i < validAdrs.length; i++) {
        let pay = (validScores[i] * amt).toFixed(18).toString();
        const x = BigNumber.from(toWei(pay));
        amts.push(x);
        adrs.push(validAdrs[i])
        tot = tot.add(x);
      }
      console.log(adrs, amts)
      setTotal(tot);
      setAmounts(amts);
      setAddresses(adrs)
    }
  };

  const handleReceipt = res => {
    if (res && (res.status === "confirmed" || res.status === 1)) {
      console.log(" 🍾 Transaction " + res.hash + " finished!");
      const receipt = {
        account: address,
        amount: total,
        token: tokenInstance?.address,
        txn: res.hash,
      };
      const receipts = partyData.receipts;
      receipts.push(receipt);
      dbInstance.updateParty(partyData.id, { receipts: receipts });
    }
    setIsDistributionLoading(false);
  };

  // Distribute either Eth, or loaded erc20
  const distribute = () => {
    
    try {
      if (partyData && partyData.ballots.length > 0) {
        setIsDistributionLoading(true);
        // Distribute the funds
        if (tokenInstance && amounts && addresses) {
          tx(
            writeContracts.Distributor.distributeToken(tokenInstance.address, addresses, amounts, partyData.id),
            handleReceipt,
          );
        } else {
          tx(
            writeContracts.Distributor.distributeEther(addresses, amounts, partyData.id, { value: total }),
            handleReceipt,
          );
        }
      }
    } catch {
      setIsDistributionLoading(false);
    }
  };

  const DistributeButton = () => {
    return (
      <>
        {tokenInstance && !hasApprovedAllowance ? (
          <Button onClick={approve} isLoading={isApprovalLoading}>
            Approve
          </Button>
        ) : (
          <Button onClick={distribute} isLoading={isDistributionLoading}>
            Distribute
          </Button>
        )}
      </>
    );
  };

  return (
    <Box borderWidth={"1px"} padding={6}>
      <HStack pl={"6%"} pr={"6%"}>
        <Input onChange={handleTokenChange} placeholder="ex: 0xde30da39c46104798bb5aa3fe8b9e0e1f348163f"></Input>
        <Spacer />
        <Button onClick={loadToken} isLoading={isTokenLoading}>
          Load Token
        </Button>
      </HStack>
      <HStack pl={"6%"} pr={"6%"} pt={4}>
        <Spacer />
        <NumberInput onChange={handleAmountChange}>
          <NumberInputField placeholder="1" />
        </NumberInput>
        <DistributeButton />
      </HStack>
      {/* <>{amounts}</> */}
    </Box>
  );
};
