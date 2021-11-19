const { ethers } = require("hardhat");
const { use } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("pay.party", function () {
  describe("Diplomat", function () {
    it("should deploy Diplomat", async function () {
      const Diplomat = await ethers.getContractFactory("Diplomat");
      diplomat = await Diplomat.deploy();
      // console.log(diplomacy)
    });

    describe("newElection()", function () {
      it("should be able to create new election", async function () {
        await diplomat.createElection("testId");
      });
    });

    // describe("endElection()", function () {
    //   it("should be able to end an election", async function () {
    //     await diplomat.endElection("testId");
    //   });
    // });

    describe("payoutElection()", function () {
      it("should be able to payout an election", async function () {
        await diplomat.payElection(
          "testId",
          [
            "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            "0x01684C57AE8a4226271068210Ce1cCED865a5AfC",
            "0xf5De4337Ac5332aF11BffbeC45D950bDDBc1493F",
            "0x4E53E14de4e264AC2C3fF501ed3Bd6c4Ad63B9A1",
          ],
          [1, 1, 1, 1],
          "0x0000000000000000000000000000000000000000",
          {
            value: 4,
          }
        );
      });
    });
  });
});
