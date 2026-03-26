// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

library Errors {
    error Unauthorized();
    error ZeroAddress();
    error InvalidConfiguration();
    error ArrayLengthMismatch();
    error TransferFailed();
}