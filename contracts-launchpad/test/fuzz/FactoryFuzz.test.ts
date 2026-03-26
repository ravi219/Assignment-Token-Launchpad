import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
upgrades.silenceWarnings();
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { TokenFactory } from "../../typechain-types";
import crypto from "crypto";

describe("TokenFactory Fuzzing", function () {
  let factory: TokenFactory;
  let admin: SignerWithAddress;

  before(async function () {
    [admin] = await ethers.getSigners();
    const Implementation = await ethers.getContractFactory("LaunchpadToken");
    const impl = await Implementation.deploy();

    const Factory = await ethers.getContractFactory("TokenFactory");
    factory = (await upgrades.deployProxy(Factory, [await impl.getAddress(), admin.address], {
      kind: "uups",
      unsafeAllow: ["constructor"],
    })) as unknown as TokenFactory;
  });

  // Helper to generate random strings
  const randomString = (length: number) => crypto.randomBytes(length).toString("hex");

  it("Should handle creation of tokens with randomized valid parameters", async function () {
    const iterations = 10; // Run 10 randomized fuzz iterations

    for (let i = 0; i < iterations; i++) {
      const name = randomString(Math.floor(Math.random() * 20) + 1); // Random length 1-20
      const symbol = randomString(Math.floor(Math.random() * 5) + 1).toUpperCase();
      const decimals = Math.floor(Math.random() * 18) + 1; // 1 to 18 decimals
      
      // Random supply between 1 and 1,000,000,000
      const randomSupply = Math.floor(Math.random() * 1000000000) + 1;
      const initialSupply = ethers.parseUnits(randomSupply.toString(), decimals);

      const tx = await factory.createToken(name, symbol, decimals, initialSupply, admin.address);
      await tx.wait();

      const tokens = await factory.getUserTokens(admin.address);
      const latestTokenAddress = tokens[tokens.length - 1];
      const token = await ethers.getContractAt("LaunchpadToken", latestTokenAddress);

      expect(await token.name()).to.equal(name);
      expect(await token.symbol()).to.equal(symbol);
      expect(await token.decimals()).to.equal(decimals);
      expect(await token.balanceOf(admin.address)).to.equal(initialSupply);
    }
    
    expect(await factory.getAllTokensCount()).to.equal(iterations);
  });
});