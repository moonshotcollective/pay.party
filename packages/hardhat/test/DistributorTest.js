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
    setTimeout(done, 4000);
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
      ];
      const amounts = ["0x1000", "0x1000", "0x1000", "0x1000"];
      await Distributor.distributeEther(recipients, amounts, "test", {
        value: "0x4000",
      });
    });

    it("Should distribute tokens", async () => {
      const recipients = [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0x01684C57AE8a4226271068210Ce1cCED865a5AfC",
        "0xf5De4337Ac5332aF11BffbeC45D950bDDBc1493F",
        "0x4E53E14de4e264AC2C3fF501ed3Bd6c4Ad63B9A1",
      ];
      const amounts = ["0x1000", "0x1000", "0x1000", "0x1000"];
      await Token.approve(Distributor.deployTransaction.creates, "0x4000");
      await Distributor.distributeToken(
        Token.address,
        recipients,
        amounts,
        "test"
      );
    });
  });
});
