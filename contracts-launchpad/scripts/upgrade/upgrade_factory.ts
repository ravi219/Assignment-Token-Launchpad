import { ethers, upgrades } from "hardhat";

async function main() {
  // REPLACE with your deployed factory proxy address
  const PROXY_ADDRESS = process.env.FACTORY_ADDRESS || "0x_YOUR_DEPLOYED_FACTORY_PROXY";

  const [upgrader] = await ethers.getSigners();
  console.log("Upgrading factory with account:", upgrader.address);

  // Assuming you create a new contract called TokenFactoryV2
  const TokenFactoryV2 = await ethers.getContractFactory("TokenFactory"); // Change to TokenFactoryV2 when you write it
  
  console.log("Preparing upgrade...");
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, TokenFactoryV2);
  await upgraded.waitForDeployment();

  console.log("TokenFactory successfully upgraded!");
  console.log("Proxy remains at:", await upgraded.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});