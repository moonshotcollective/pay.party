const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { BigNumber } = require("ethers");
const { toWei } = require("web3-utils");

use(solidity);

describe("Pay Party Test", () => {
  let Distributor;
  let Token;
  let owner, spender, holder;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 10000);
  });

  beforeEach(async () => {
    [owner, spender, holder] = await ethers.getSigners();
    const TokenFactory = await ethers.getContractFactory("Token");
    Token = await TokenFactory.deploy(owner.address, "TOKEN", "TST");
  });

  describe("Distributor Contract", () => {
    it("Should deploy Distributor", async () => {
      const DistributorFactory = await ethers.getContractFactory("Distributor");
      Distributor = await DistributorFactory.deploy();
    });

    it("Should distribute ether", async () => {
      const recipients = [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0x01684C57AE8a4226271068210Ce1cCED865a5AfC",
        "0xf5De4337Ac5332aF11BffbeC45D950bDDBc1493F",
        "0x4E53E14de4e264AC2C3fF501ed3Bd6c4Ad63B9A1",
        "0xF9E401ca2b801Fad97A0267D7E26693D0c62d99D",
        "0xf7a5fdccB356C6FC296EE08bc991aE6c69c18ce2",
        "0x6b541b78349097714B9D1aB6A788dB5e0dCF21a3",
        "0x802999C71263f7B30927F720CF0AC10A76a0494C",
        "0x53CD80E82fcCc06C949c8e0e8A53082852877f5e",
        "0xa8dA6166cbD2876cCde424eE2a717C355bE4702B",
        "0x997e0165bbD5C91FCB5d9dAc0635F3F18223C71E",
        "0xb4b3614Ff9767F925b83BEd267a6b8F277db7b0C",
      ];
      const amounts = [
        "0x1000",
        "0x1000",
        "0x1000",
        "0x1000",
        "0x1000",
        "0x1000",
        "0x1000",
        "0x1000",
        "0x1000",
        "0x1000",
        "0x1000",
        "0x1000",
      ];
      await Distributor.distributeEther(recipients, amounts, "test", {
        value: toWei("12"),
      });
    });

    it("Should distribute tokens", async () => {
      const recipients = [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0x01684C57AE8a4226271068210Ce1cCED865a5AfC",
        "0xf5De4337Ac5332aF11BffbeC45D950bDDBc1493F",
        "0x4E53E14de4e264AC2C3fF501ed3Bd6c4Ad63B9A1",
        "0xF9E401ca2b801Fad97A0267D7E26693D0c62d99D",
        "0xf7a5fdccB356C6FC296EE08bc991aE6c69c18ce2",
        "0x6b541b78349097714B9D1aB6A788dB5e0dCF21a3",
        "0x802999C71263f7B30927F720CF0AC10A76a0494C",
        "0x53CD80E82fcCc06C949c8e0e8A53082852877f5e",
        "0xa8dA6166cbD2876cCde424eE2a717C355bE4702B",
        "0x997e0165bbD5C91FCB5d9dAc0635F3F18223C71E",
        "0xb4b3614Ff9767F925b83BEd267a6b8F277db7b0C",
      ];
      const amounts = [
        "0x1000",
        "0x1000",
        "0x1000",
        "0x1000",
        "0x1000",
        "0x1000",
        "0x1000",
        "0x1000",
        "0x1000",
        "0x1000",
        "0x1000",
        "0x1000",
      ];
      await Token.approve(Distributor.deployTransaction.creates, toWei("12"));
      await Distributor.distributeToken(
        Token.address,
        recipients,
        amounts,
        "test"
      );
    });
  });
});
