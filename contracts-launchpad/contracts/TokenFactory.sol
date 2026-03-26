// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Errors} from "./libraries/Errors.sol";
import {ILaunchpadToken} from "./interfaces/ILaunchpadToken.sol";

contract TokenFactory is Initializable, AccessControlUpgradeable, UUPSUpgradeable, PausableUpgradeable, ReentrancyGuard {
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    address public tokenImplementation;
    
    // Registry tracking
    address[] public allTokens;
    mapping(address => address[]) public userTokens;

    event TokenCreated(address indexed tokenAddress, address indexed owner, string name, string symbol);
    event ImplementationUpdated(address indexed oldImplementation, address indexed newImplementation);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _tokenImplementation, address _admin) external initializer {
        if (_tokenImplementation == address(0)) revert Errors.ZeroAddress();
        if (_admin == address(0)) revert Errors.ZeroAddress();

        __AccessControl_init();

        __Pausable_init();

        tokenImplementation = _tokenImplementation;

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(UPGRADER_ROLE, _admin);
        _grantRole(CREATOR_ROLE, _admin);
    }

    function setTokenImplementation(address _newImplementation) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_newImplementation == address(0)) revert Errors.ZeroAddress();
        address old = tokenImplementation;
        tokenImplementation = _newImplementation;
        emit ImplementationUpdated(old, _newImplementation);
    }

    function createToken(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply,
        address tokenOwner
    ) external onlyRole(CREATOR_ROLE) whenNotPaused nonReentrant returns (address) {
        if (tokenOwner == address(0)) revert Errors.ZeroAddress();

        address clone = Clones.clone(tokenImplementation);
        
        ILaunchpadToken(clone).initialize(
            name,
            symbol,
            decimals,
            initialSupply,
            tokenOwner,
            msg.sender // Factory operator gets emergency admin rights over token
        );

        allTokens.push(clone);
        userTokens[tokenOwner].push(clone);

        emit TokenCreated(clone, tokenOwner, name, symbol);
        return clone;
    }

    function getUserTokens(address user) external view returns (address[] memory) {
        return userTokens[user];
    }

    function getAllTokensCount() external view returns (uint256) {
        return allTokens.length;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
}