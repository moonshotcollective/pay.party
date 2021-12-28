const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { BigNumber } = require("ethers");
const { toWei } = require("web3-utils");

use(solidity);

describe("Pay Party Test", function () {
  let Distributor;
  let Token;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 4000);
  });
  let owner, spender, holder;
  beforeEach(async () => {
    [owner, spender, holder] = await ethers.getSigners();
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
      const amounts = [
        BigNumber.from(toWei("1")),
        BigNumber.from(toWei("1")),
        BigNumber.from(toWei("1")),
        BigNumber.from(toWei("1")),
      ];
      await Distributor.distributeEther(recipients, amounts, {
        value: toWei("4"),
      });
    });

    it("Should deploy Test Token", async () => {
      const TokenFactory = await ethers.getContractFactory("Token");
      // const sender = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; //await ethers.getSigners()[0];
      Token = await TokenFactory.deploy(owner.address, "TOKEN", "TST");
    });

    // it("Should get approved Token allowance", async () => {
    //   const signer = await ethers.getSigners()[0];
    // await Token.connect("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266").approve(
    //   "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    //   toWei("500")
    // );
    // });

    it("Should distribute tokens", async () => {
      const recipients = [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0x01684C57AE8a4226271068210Ce1cCED865a5AfC",
        "0xf5De4337Ac5332aF11BffbeC45D950bDDBc1493F",
        "0x4E53E14de4e264AC2C3fF501ed3Bd6c4Ad63B9A1",
      ];
      const amounts = [
        BigNumber.from(toWei("1")),
        BigNumber.from(toWei("0")),
        BigNumber.from(toWei("0")),
        BigNumber.from(toWei("0")),
      ];
      await Token.approve(holder.address, BigNumber.from(toWei("4")));
      await Token.transfer(holder.address, toWei("4"));
      // WIP
      // const x = await Token.balanceOf(holder.address);
      // const u = await Token.allowance(owner.address, holder.address);
      // console.log(x.toString());
      // console.log(u.toString());
      // await Distributor.connect(holder).distributeToken(
      //   tokenAdr,
      //   recipients,
      //   amounts
      // );
    });
  });
});
