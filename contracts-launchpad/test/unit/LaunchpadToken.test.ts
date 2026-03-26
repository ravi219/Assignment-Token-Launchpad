import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
upgrades.silenceWarnings();
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { TokenFactory, LaunchpadToken } from "../../typechain-types";

describe("Launchpad Integration Flow", function () {
  let factory: TokenFactory;
  let admin: SignerWithAddress;
  let platformUser: SignerWithAddress;
  let tokenBuyer: SignerWithAddress;

  const CREATOR_ROLE = ethers.id("CREATOR_ROLE");

  before(async function () {
    [admin, platformUser, tokenBuyer] = await ethers.getSigners();

    // Deploy Implementation
    const Implementation = await ethers.getContractFactory("LaunchpadToken");
    const impl = await Implementation.deploy();

    // Deploy Factory
    const Factory = await ethers.getContractFactory("TokenFactory");
    factory = (await upgrades.deployProxy(Factory, [await impl.getAddress(), admin.address], {
      kind: "uups",
      unsafeAllow: ["constructor"],
    })) as unknown as TokenFactory;

    // Grant creator role to our platform user
    await factory.grantRole(CREATOR_ROLE, platformUser.address);
  });

  it("Full Lifecycle: Create, Mint, Pause, and Transfer", async function () {
    // 1. User creates a token
    const initialSupply = ethers.parseEther("10000");
    const tx = await factory.connect(platformUser).createToken(
      "Game Coin", "GMC", 18, initialSupply, platformUser.address
    );
    const receipt = await tx.wait();

    // 2. Fetch the newly deployed token
    const userTokens = await factory.getUserTokens(platformUser.address);
    const deployedTokenAddress = userTokens[0];
    const token = await ethers.getContractAt("LaunchpadToken", deployedTokenAddress);

    // 3. Verify Initial State
    expect(await token.balanceOf(platformUser.address)).to.equal(initialSupply);

    // 4. Token Creator mints more tokens to a buyer
    await token.connect(platformUser).mint(tokenBuyer.address, ethers.parseEther("500"));
    expect(await token.balanceOf(tokenBuyer.address)).to.equal(ethers.parseEther("500"));

    // 5. Token Creator pauses the token (emergency)
    await token.connect(platformUser).pause();
    
    // 6. Transfers should fail while paused
    await expect(
      token.connect(tokenBuyer).transfer(platformUser.address, ethers.parseEther("10"))
    ).to.be.revertedWithCustomError(token, "EnforcedPause");

    // Test unauthorized role branches
    await expect(token.connect(tokenBuyer).mint(tokenBuyer.address, 100))
      .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
    await expect(token.connect(tokenBuyer).burn(100))
      .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
    await expect(token.connect(tokenBuyer).pause())
      .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
    await expect(token.connect(tokenBuyer).unpause())
      .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");

    // 7. Token Creator unpauses and transfer succeeds
    await token.connect(platformUser).unpause();
    await token.connect(tokenBuyer).transfer(platformUser.address, ethers.parseEther("10"));
    
    expect(await token.balanceOf(tokenBuyer.address)).to.equal(ethers.parseEther("490"));

    // 8. Token Creator burns some tokens
    await token.connect(platformUser).burn(ethers.parseEther("500"));
    expect(await token.balanceOf(platformUser.address)).to.equal(ethers.parseEther("9510"));
  });

  it("Should revert LaunchpadToken initialization with zero owner or admin", async function () {
    const Implementation = await ethers.getContractFactory("LaunchpadToken");
    
    const impl = await Implementation.deploy();
    
    const Deployer = await ethers.getContractFactory("CoverageDeployer");
    const deployer = await Deployer.deploy();
    
    await expect(deployer.deployLaunchpadZeroOwner(await impl.getAddress()))
      .to.be.revertedWithCustomError(impl, "ZeroAddress");
      
    await expect(deployer.deployLaunchpadZeroAdmin(await impl.getAddress()))
      .to.be.revertedWithCustomError(impl, "ZeroAddress");
  });

  it("Should revert restricting functions when paused", async function () {
    const userTokens = await factory.getUserTokens(platformUser.address);
    const token = await ethers.getContractAt("LaunchpadToken", userTokens[0]);

    await token.connect(platformUser).pause();

    await expect(token.connect(platformUser).mint(platformUser.address, 100))
      .to.be.revertedWithCustomError(token, "EnforcedPause");
      
    await expect(token.connect(platformUser).burn(100))
      .to.be.revertedWithCustomError(token, "EnforcedPause");
      
    await token.connect(platformUser).unpause();
  });

  it("Should handle initialization with zero initial supply", async function () {
    const Implementation = await ethers.getContractFactory("LaunchpadToken");
    
    await expect(
      upgrades.deployProxy(Implementation, ["T", "T", 18, 0, admin.address, admin.address], { kind: "transparent", unsafeAllow: ["constructor"] })
    ).to.not.be.reverted;
  });

  it("Should revert if initialize is called twice", async function () {
    const userTokens = await factory.getUserTokens(platformUser.address);
    const token = await ethers.getContractAt("LaunchpadToken", userTokens[0]);
    await expect(
      token.initialize("T", "T", 18, 100, platformUser.address, admin.address)
    ).to.be.revertedWithCustomError(token, "InvalidInitialization");
  });
});