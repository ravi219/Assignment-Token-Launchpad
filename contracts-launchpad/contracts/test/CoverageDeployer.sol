// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {ILaunchpadToken} from "../interfaces/ILaunchpadToken.sol";
import {TokenFactory} from "../TokenFactory.sol";

contract CoverageDeployer {
    function deployLaunchpadZeroOwner(address impl) external {
        address clone = Clones.clone(impl);
        ILaunchpadToken(clone).initialize("T", "T", 18, 0, address(0), msg.sender);
    }

    function deployLaunchpadZeroAdmin(address impl) external {
        address clone = Clones.clone(impl);
        ILaunchpadToken(clone).initialize("T", "T", 18, 0, msg.sender, address(0));
    }

    function deployFactoryZeroImpl(address factoryImpl) external {
        new ERC1967Proxy(factoryImpl, abi.encodeWithSelector(TokenFactory.initialize.selector, address(0), msg.sender));
    }

    function deployFactoryZeroAdmin(address factoryImpl, address nonZeroImpl) external {
        new ERC1967Proxy(factoryImpl, abi.encodeWithSelector(TokenFactory.initialize.selector, nonZeroImpl, address(0)));
    }
}
