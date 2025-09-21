const { ethers } = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC_URL);
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

const escrowABI = require("../../blockchain/artifacts/contracts/InvoiceEscrow.sol/InvoiceEscrow.json").abi;
const escrowAddress = process.env.ESCROW_CONTRACT_ADDRESS;

const escrowContract = new ethers.Contract(escrowAddress, escrowABI, wallet);

module.exports = { escrowContract, wallet };
