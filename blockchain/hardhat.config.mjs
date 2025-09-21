import { config as loadEnv } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";

export default {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: process.env.v,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80002,
    },
    hardhat: {
      chainId: 1337,
    },
  },
};

import { config as loadEnv } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

loadEnv();

const RPC_URL = process.env.RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

if (!RPC_URL) {
  throw new Error("RPC_URL is not defined in .env");
}
if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is not defined in .env");
}

const config = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: "https://polygon-amoy.g.alchemy.com/v2/4TQcvUbhY5lsBsTb09zKF",
      accounts: [PRIVATE_KEY],
      chainId: 80002, // Chain ID for Polygon Amoy Testnet
    },
    hardhat: {
      chainId: 1337
    }
  }
};

//export default /** @type {HardhatUserConfig} */ (config);
