const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InvoiceEscrow MVP", function () {
  let owner, issuer, payer;
  let escrow, token, MockERC20;

  beforeEach(async function () {
    [owner, issuer, payer] = await ethers.getSigners();

    MockERC20 = await ethers.getContractFactory("MockERC20");
    token = await MockERC20.deploy("MockUSD", "mUSD", 18);
    await token.waitForDeployment();
    await token.mint(payer.address, ethers.parseUnits("10000", 18));

    const InvoiceEscrow = await ethers.getContractFactory("InvoiceEscrow");
    escrow = await InvoiceEscrow.deploy();
    await escrow.waitForDeployment();
  });

  it("should anchor invoice and store hash", async function () {
    const hash = ethers.keccak256(ethers.toUtf8Bytes("invoice-1"));
    const amount = ethers.parseUnits("100", 18);
    await escrow.connect(issuer).anchorInvoice(hash, payer.address, amount, token.target);

    const inv = await escrow.getInvoice(0);
    expect(inv.invoiceHash).to.equal(hash);
    expect(inv.issuer).to.equal(issuer.address);
  });

  it("should deposit ERC20 and release", async function () {
    const hash = ethers.keccak256(ethers.toUtf8Bytes("invoice-2"));
    const amount = ethers.parseUnits("200", 18);

    await escrow.connect(issuer).anchorInvoice(hash, payer.address, amount, token.target);
    await token.connect(payer).approve(escrow.target, amount);
    await escrow.connect(payer).deposit(0);

    await escrow.connect(owner).release(0);

    const bal = await token.balanceOf(issuer.address);
    expect(bal).to.equal(amount);
  });
});
