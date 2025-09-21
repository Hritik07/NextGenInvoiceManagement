import { ethers } from "hardhat";

async function main() {
    console.log("Deploying to network:", (await ethers.ggetDefaultProvider()).network);

  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy();
  await escrow.deployed();
  console.log("InvoiecEscrow deployed at:", escrow.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
