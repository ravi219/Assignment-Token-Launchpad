import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
upgrades.silenceWarnings();
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { TokenFactory, LaunchpadToken } from "../../typechain-types";

describe("TokenFactory System", function () {
  let factory: TokenFactory;
  let implementation: LaunchpadToken;
  let admin: SignerWithAddress;
  let creator: SignerWithAddress;
  let user: SignerWithAddress;

  const CREATOR_ROLE = ethers.id("CREATOR_ROLE");

  beforeEach(async function () {
    [admin, creator, user] = await ethers.getSigners();

    const LaunchpadTokenFactory = await ethers.getContractFactory("LaunchpadToken");
    implementation = await LaunchpadTokenFactory.deploy();

    const TokenFactoryFactory = await ethers.getContractFactory("TokenFactory");
    factory = (await upgrades.deployProxy(TokenFactoryFactory, [
      await implementation.getAddress(),
      admin.address
    ], { kind: "uups", unsafeAllow: ["constructor"] })) as unknown as TokenFactory;

    await factory.grantRole(CREATOR_ROLE, creator.address);
  });

  describe("Token Creation", function () {
    it("Should create a new token and register it correctly", async function () {
      const tx = await factory.connect(creator).createToken("Test Token", "TST", 18, ethers.parseEther("1000"), user.address);
      const receipt = await tx.wait();
      
      const userTokens = await factory.getUserTokens(user.address);
      expect(userTokens.length).to.equal(1);
      
      const tokenAddress = userTokens[0];
      const token = await ethers.getContractAt("LaunchpadToken", tokenAddress);
      
      expect(await token.name()).to.equal("Test Token");
      expect(await token.symbol()).to.equal("TST");
      expect(await token.balanceOf(user.address)).to.equal(ethers.parseEther("1000"));
    });

    it("Should revert if unauthorized user tries to create token", async function () {
      await expect(
        factory.connect(user).createToken("Hacker Token", "HCK", 18, 1000, user.address)
      ).to.be.revertedWithCustomError(factory, "AccessControlUnauthorizedAccount");
    });

    it("Should revert createToken with zero owner address", async function () {
      await expect(
        factory.connect(creator).createToken("Test Token", "TST", 18, ethers.parseEther("1000"), ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(factory, "ZeroAddress");
    });
  });

  describe("Admin Flexibility & Upgrades", function () {
    it("Should allow UPGRADER_ROLE to upgrade the factory", async function () {
      const FactoryV2 = await ethers.getContractFactory("TokenFactory");
      await expect(upgrades.upgradeProxy(await factory.getAddress(), FactoryV2, { unsafeAllow: ["constructor"] })).to.not.be.reverted;
    });

    it("Should allow DEFAULT_ADMIN_ROLE to set a new token implementation", async function () {
      const NewImplFactory = await ethers.getContractFactory("LaunchpadToken");
      const newImpl = await NewImplFactory.deploy();
      await expect(factory.connect(admin).setTokenImplementation(await newImpl.getAddress()))
        .to.emit(factory, "ImplementationUpdated")
        .withArgs(await implementation.getAddress(), await newImpl.getAddress());
      expect(await factory.tokenImplementation()).to.equal(await newImpl.getAddress());
    });

    it("Should revert if new implementation is zero address", async function () {
      await expect(factory.connect(admin).setTokenImplementation(ethers.ZeroAddress))
        .to.be.revertedWithCustomError(factory, "ZeroAddress");
    });
    
    it("Should revert initialization with zero addresses", async function () {
      const TokenFactoryFactory = await ethers.getContractFactory("TokenFactory");
      const factoryImpl = await TokenFactoryFactory.deploy();
      
      const Deployer = await ethers.getContractFactory("CoverageDeployer");
      const deployer = await Deployer.deploy();

      await expect(
        deployer.deployFactoryZeroImpl(await factoryImpl.getAddress())
      ).to.be.revertedWithCustomError(TokenFactoryFactory, "ZeroAddress");

      await expect(
        deployer.deployFactoryZeroAdmin(await factoryImpl.getAddress(), await implementation.getAddress())
      ).to.be.revertedWithCustomError(TokenFactoryFactory, "ZeroAddress");
    });
  });

  describe("Pausable", function () {
    it("Should allow DEFAULT_ADMIN_ROLE to pause and unpause the factory", async function () {
      await factory.connect(admin).pause();
      
      await expect(
        factory.connect(creator).createToken("Test", "TST", 18, 1000, user.address)
      ).to.be.revertedWithCustomError(factory, "EnforcedPause");
      
      await factory.connect(admin).unpause();
      
      await expect(
        factory.connect(creator).createToken("Test", "TST", 18, 1000, user.address)
      ).to.not.be.reverted;
    });

    it("Should revert if unauthorized user calls admin functions", async function () {
      await expect(factory.connect(user).setTokenImplementation(ethers.ZeroAddress))
        .to.be.revertedWithCustomError(factory, "AccessControlUnauthorizedAccount");
      
      await expect(factory.connect(user).pause())
        .to.be.revertedWithCustomError(factory, "AccessControlUnauthorizedAccount");
      
      await expect(factory.connect(user).unpause())
        .to.be.revertedWithCustomError(factory, "AccessControlUnauthorizedAccount");
    });
    
    it("Should revert if unauthorized user attempts to upgrade", async function () {
      const FactoryV2 = await ethers.getContractFactory("TokenFactory");
      const v2Impl = await FactoryV2.deploy();
      await expect(
        factory.connect(user).upgradeToAndCall(await v2Impl.getAddress(), "0x")
      ).to.be.revertedWithCustomError(factory, "AccessControlUnauthorizedAccount");
    });
    it("Should revert on reentrant calls to createToken", async function () {
      const Malicious = await ethers.getContractFactory("MaliciousToken");
      const malicious = await Malicious.deploy();
      await factory.connect(admin).setTokenImplementation(await malicious.getAddress());

      const Helper = await ethers.getContractFactory("Helper");
      const helper = await Helper.deploy();
      
      // Grant helper the role to bypass initial check
      await factory.grantRole(CREATOR_ROLE, await helper.getAddress());
      
      await expect(
        factory.connect(creator).createToken("T", "T", 18, 0, await helper.getAddress())
      ).to.be.revertedWithCustomError(factory, "ReentrancyGuardReentrantCall");
    });

    it("Should revert if initialize is called twice", async function () {
      await expect(
        factory.connect(admin).initialize(ethers.ZeroAddress, admin.address)
      ).to.be.revertedWithCustomError(factory, "InvalidInitialization");
    });
  });
});