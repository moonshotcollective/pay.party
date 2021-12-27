//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Token is ERC20 {
    constructor(address sender, string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(sender, 1000000 ether);
    }
}