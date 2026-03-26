// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

interface ITokenFactoryMock {
    function createToken(string memory name, string memory symbol, uint8 decimals, uint256 initialSupply, address tokenOwner) external returns (address);
}

contract Helper {
    function attack(address factory) external {
        ITokenFactoryMock(factory).createToken("M", "M", 18, 0, address(this));
    }
}

contract MaliciousToken {
    function initialize(
        string memory,
        string memory,
        uint8,
        uint256,
        address tokenOwner,
        address
    ) external {
        Helper(tokenOwner).attack(msg.sender);
    }
}
