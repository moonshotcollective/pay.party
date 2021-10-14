const { ethers } = require("hardhat");
const { use } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Quadratic Diplomacy", function () {
  describe("Diplomat", function () {
    it("should deploy Diplomat", async function () {
      const Diplomat = await ethers.getContractFactory("Diplomat");
      diplomat = await Diplomat.deploy();
      // console.log(diplomacy)
    });

    describe("newElection()", function () {
      //   it("should fail to create new election with duplicate addresses", async function () {
      //     await expect(
      //       diplomacy.newElection(
      //         "Build #1",
      //         4,
      //         "0x0000000000000000000000000000000000000000",
      //         10,
      //         [
      //           "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      //           "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // duplicated
      //           "0xf5De4337Ac5332aF11BffbeC45D950bDDBc1493F",
      //           "0x4E53E14de4e264AC2C3fF501ed3Bd6c4Ad63B9A1",
      //         ]
      //       )
      //     ).to.revertedWith("Duplicate Addresses Detected!");
      //   });

      it("should be able to create new election", async function () {
        await diplomat.createElection("testId");
      });
    });

    // describe("castBallot()", function () {
    //   it("should fail to cast a ballot with duplicate addresses", async function () {
    //     await expect(
    //       diplomacy.castBallot(
    //         0,
    //         [
    //           "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    //           "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // duplicate
    //           "0xf5De4337Ac5332aF11BffbeC45D950bDDBc1493F",
    //           "0x4E53E14de4e264AC2C3fF501ed3Bd6c4Ad63B9A1",
    //         ],
    //         [100, 200, 100, 0]
    //       )
    //     ).to.revertedWith("Duplicate Addresses Detected!");
    //   });

    //   it("should be able to cast a ballot", async function () {
    //     await diplomacy.castBallot(
    //       0,
    //       [
    //         "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    //         "0x01684C57AE8a4226271068210Ce1cCED865a5AfC",
    //         "0xf5De4337Ac5332aF11BffbeC45D950bDDBc1493F",
    //         "0x4E53E14de4e264AC2C3fF501ed3Bd6c4Ad63B9A1",
    //       ],
    //       [100, 200, 100, 0]
    //       // 2
    //     );
    //   });
    // });

    // describe("endElection()", function () {
    //   it("should be able to end an election", async function () {
    //     await diplomacy.endElection(0);
    //   });
    // });

    // describe("payoutElection()", function () {
    //   it("should be able to payout an election", async function () {
    //     await diplomacy.payoutElection(
    //       0,
    //       [
    //         "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    //         "0x01684C57AE8a4226271068210Ce1cCED865a5AfC",
    //         "0xf5De4337Ac5332aF11BffbeC45D950bDDBc1493F",
    //         "0x4E53E14de4e264AC2C3fF501ed3Bd6c4Ad63B9A1",
    //       ],
    //       [1, 1, 1, 1],
    //       {
    //         value: 4,
    //       }
    //     );
    //   });
    // });
  });
});
