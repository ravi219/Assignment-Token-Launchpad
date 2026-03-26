import { ethers } from "hardhat";

async function main() {
  // REPLACE with your deployed factory proxy address
  const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || "0x_YOUR_DEPLOYED_FACTORY_PROXY";
  
  // REPLACE with the addresses you want to grant roles to
  const newCreatorAddress = "0x_SOME_CREATOR_ADDRESS";

  const [admin] = await ethers.getSigners();
  console.log("Setting up roles with admin account:", admin.address);

  const factory = await ethers.getContractAt("TokenFactory", FACTORY_ADDRESS);

  const CREATOR_ROLE = await factory.CREATOR_ROLE();

  console.log(`Granting CREATOR_ROLE to ${newCreatorAddress}...`);
  const tx = await factory.grantRole(CREATOR_ROLE, newCreatorAddress);
  await tx.wait();

  console.log("Roles setup successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});