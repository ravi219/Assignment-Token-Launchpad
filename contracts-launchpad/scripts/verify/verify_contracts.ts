import hre from "hardhat";

async function main() {
  // Utilizing the recently deployed addresses from Sepolia
  const launchpadProxyAddress = "0xf07Cf33D2F8937A507Da80A0ec22E2faAe00cFa5";
  const factoryProxyAddress = "0x71b9281f59a1E060E9424409a8E56509FB5b59FA";

  console.log("-------------------------------------------------");
  
  console.log("Verifying LaunchpadToken Implementation...");
  try {
    const launchpadImplAddress = await hre.upgrades.erc1967.getImplementationAddress(launchpadProxyAddress);
    await hre.run("verify:verify", {
      address: launchpadImplAddress,
      constructorArguments: [],
    });
  } catch (error) {
    console.warn("Launchpad implementation verification failed or already verified.");
  }

  console.log("\nVerifying TokenFactory Implementation...");
  try {
    const factoryImplAddress = await hre.upgrades.erc1967.getImplementationAddress(factoryProxyAddress);
    await hre.run("verify:verify", {
      address: factoryImplAddress,
      constructorArguments: [],
    });
  } catch (error) {
    console.warn("Factory implementation verification failed or already verified.");
  }

  // Attempt to submit Proxies directly to let the plugin map ABI linkages
  console.log("\nVerifying LaunchpadToken Proxy Wrapper...");
  try {
    await hre.run("verify:verify", {
      address: launchpadProxyAddress,
      constructorArguments: [],
    });
  } catch (error) {
    console.warn("Launchpad proxy verification skipped or already handled by Etherscan.");
  }

  console.log("\nVerifying TokenFactory Proxy Wrapper...");
  try {
    await hre.run("verify:verify", {
      address: factoryProxyAddress,
      constructorArguments: [],
    });
  } catch (error) {
    console.warn("Factory proxy verification skipped or already handled by Etherscan.");
  }
  
  console.log("\nVerification complete for Sepolia Contracts.");
}

main().catch(console.error);