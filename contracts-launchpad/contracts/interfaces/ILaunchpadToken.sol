// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title ILaunchpadToken
 * @dev Interface for the LaunchpadToken implementation, supporting standard 
 * ERC20 functionality with custom initialization and access controls.
 */
interface ILaunchpadToken {
    /**
     * @notice Initializes the upgradeable token proxy.
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param decimals_ The number of decimals for the token.
     * @param initialSupply_ The amount of tokens to mint to the owner upon creation.
     * @param owner_ The address that will receive initial supply and admin roles.
     * @param factoryAdmin_ The address of the factory operator for emergency oversight.
     */
    function initialize(
        string calldata name_,
        string calldata symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        address owner_,
        address factoryAdmin_
    ) external;

    /**
     * @notice Mints new tokens to a specific address.
     * @dev Restricted to addresses with MINTER_ROLE.
     */
    function mint(address to, uint256 amount) external;

    /**
     * @notice Burns tokens from the caller's balance.
     * @dev Restricted to addresses with BURNER_ROLE.
     */
    function burn(uint256 amount) external;

    /**
     * @notice Pauses all token transfers, minting, and burning.
     */
    function pause() external;

    /**
     * @notice Unpauses token activity.
     */
    function unpause() external;

    /**
     * @notice Returns the number of decimals used to get its user representation.
     */
    function decimals() external view returns (uint8);
}