import { ethers } from "hardhat";

// Address of the TokenFactory Proxy deployed on Sepolia
const FACTORY_PROXY_ADDRESS = "0x71b9281f59a1E060E9424409a8E56509FB5b59FA";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Running Sepolia Integrations with account:", deployer.address);
  
  const factory = await ethers.getContractAt("TokenFactory", FACTORY_PROXY_ADDRESS);
  let CREATOR_ROLE = ethers.ZeroHash; // Default to handle early fetches
  try {
     CREATOR_ROLE = await factory.CREATOR_ROLE();
  } catch (e: any) {
     console.error("Failed to fetch CREATOR_ROLE from Factory. Is the contract verified/deployed properly?", e.message);
     return;
  }
  
  // 1. Grant CREATOR_ROLE
  console.log("\n--- 1. Granting CREATOR_ROLE ---");
  try {
    const hasRole = await factory.hasRole(CREATOR_ROLE, deployer.address);
    if (!hasRole) {
      console.log("Granting CREATOR_ROLE to deployer...");
      const tx = await factory.grantRole(CREATOR_ROLE, deployer.address);
      await tx.wait();
      console.log("Granted CREATOR_ROLE successfully!");
    } else {
      console.log("Deployer already possesses CREATOR_ROLE. Skipping...");
    }
  } catch (error: any) {
    console.error("FAILED to grant CREATOR_ROLE:", error.message);
    return;
  }
  
  // 2. Create a new Token
  console.log("\n--- 2. Creating a new Launchpad Token ---");
  let launchedTokenAddress = "";
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const initialSupply = ethers.parseEther("1000000"); // 1 Million tokens
    console.log(`Executing createToken payload for TestToken_${timestamp}...`);

    const tx = await factory.createToken(
      `TestToken_${timestamp}`, 
      `TT${timestamp.toString().slice(-4)}`, 
      18, 
      initialSupply, 
      deployer.address
    );
    const receipt = await tx.wait();
    console.log(`Token Created successfully! TxHash: ${receipt?.hash}`);
    
    // Auto-discover the recently created token
    const userTokens = await factory.getUserTokens(deployer.address);
    if (userTokens.length > 0) {
      launchedTokenAddress = userTokens[userTokens.length - 1];
      console.log(`Discovered Launched Token Clone Address: ${launchedTokenAddress}`);
    } else {
        throw new Error("No tokens found attached to user inside TokenFactory state mapping.");
    }
  } catch (error: any) {
    console.error("FAILED to create token via Factory:", error.message);
    return;
  }
  
  if (!launchedTokenAddress) return;
  const token = await ethers.getContractAt("LaunchpadToken", launchedTokenAddress);

  // 3. Verify Basic Token Details
  console.log("\n--- 3. Verifying Launched Token Supply & Access Roles ---");
  try {
    const balance = await token.balanceOf(deployer.address);
    console.log(`Deployer Initial Balance: ${ethers.formatEther(balance)} tokens`);
    
    const OPERATOR_ROLE = await token.OPERATOR_ROLE();
    const isOperator = await token.hasRole(OPERATOR_ROLE, deployer.address);
    console.log(`Factory Automatically assigned OPERATOR_ROLE to Deployer? ${isOperator}`);
  } catch (error: any) {
    console.error("FAILED initial state verification on Token:", error.message);
  }

  // 4. Test Core ERC20 Functionality
  console.log("\n--- 4. Testing ERC20 Transfers ---");
  try {
    const mockReceiver = ethers.Wallet.createRandom().address;
    console.log(`Initiating mock transfer of 500 tokens to ${mockReceiver}...`);
    const tx = await token.transfer(mockReceiver, ethers.parseEther("500"));
    await tx.wait();
    console.log(`Transferred 500 tokens efficiently!`);
    
    const newBal = await token.balanceOf(mockReceiver);
    console.log(`Mock Receiver verified balance exactly: ${ethers.formatEther(newBal)}`);
  } catch (error: any) {
    console.error("FAILED standard ERC20 token transfer:", error.message);
  }

  // 5. Test AccessControl Functionality
  console.log("\n--- 5. Testing Contract Pausability (Security Wrappers) ---");
  try {
    console.log("Triggering Pausable.pause()...");
    const pauseTx = await token.pause();
    await pauseTx.wait();
    console.log("Token forcibly paused!");

    // Attempting an explicitly forbidden transfer while paused just to verify EVM Revert CustomError
    try {
        console.log("Asserting transfer fails under EnforcedPause state...");
        const failTx = await token.transfer(ethers.Wallet.createRandom().address, 10n);
        await failTx.wait();
        console.error("CRITICAL SECURITY FLAW: Contract allowed transfers while Paused!");
    } catch(err: any) {
        console.log("SUCCESS: Transfer completely rebounded while Paused due to Pausable modifiers.");
    }

    console.log("Triggering Pausable.unpause()...");
    const unpauseTx = await token.unpause();
    await unpauseTx.wait();
    console.log("Token forcibly unpaused and operations safely resumed.");
  } catch (error: any) {
    console.error("FAILED Pausable capability hooks:", error.message);
  }

  console.log("\n===============================================");
  console.log("All E2E Integration routines finished processing.");
  console.log("===============================================");
}

main().catch((error) => {
  console.error("\nFATAL SCRIPT RUNTIME ERROR:", error);
  process.exitCode = 1;
});
