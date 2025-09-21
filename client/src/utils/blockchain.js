import { ethers } from "ethers";
import escrowABI from "../../blockchain/artifacts/contracts/InvoiceEscrow.sol/InvoiceEscrow.json";

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const escrowAddress = import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS;
const escrowContract = new ethers.Contract(escrowAddress, escrowABI.abi, signer);

export { escrowContract, signer };
