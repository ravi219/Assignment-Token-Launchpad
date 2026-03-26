import { ethers, upgrades } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1. Deploy LaunchpadToken Proxy & Implementation
  const LaunchpadToken = await ethers.getContractFactory("LaunchpadToken");
  const launchpadProxy = await upgrades.deployProxy(
    LaunchpadToken,
    ["Launchpad Default", "LPT", 18, 0, deployer.address, deployer.address],
    {
      kind: "transparent",
      unsafeAllow: ["constructor"]
    }
  );
  await launchpadProxy.waitForDeployment();
  const launchpadProxyAddress = await launchpadProxy.getAddress();
  const launchpadImplAddress = await upgrades.erc1967.getImplementationAddress(launchpadProxyAddress);
  
  console.log("LaunchpadToken Proxy deployed to:", launchpadProxyAddress);
  console.log("LaunchpadToken Implementation deployed to:", launchpadImplAddress);

  // 2. Deploy TokenFactory Proxy & Implementation
  const TokenFactory = await ethers.getContractFactory("TokenFactory");
  const factoryProxy = await upgrades.deployProxy(
    TokenFactory, 
    [launchpadImplAddress, deployer.address], // Pass the raw implementation address so TokenFactory clones the implementation, not the proxy
    {
      kind: "uups",
      initializer: "initialize",
      unsafeAllow: ["constructor"]
    }
  );
  await factoryProxy.waitForDeployment();
  const factoryProxyAddress = await factoryProxy.getAddress();
  const factoryImplAddress = await upgrades.erc1967.getImplementationAddress(factoryProxyAddress);

  console.log("TokenFactory Proxy deployed to:", factoryProxyAddress);
  console.log("TokenFactory Implementation deployed to:", factoryImplAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});