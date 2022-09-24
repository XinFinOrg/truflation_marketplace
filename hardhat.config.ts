import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import '@openzeppelin/hardhat-upgrades'

import * as dotenv from 'dotenv'
dotenv.config()

const INFURA_API_KEY = process.env.INFURA_API_KEY
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
	version: "0.7.0"
      },
      {
	version: "0.8.15"
      },
      {
	version: "0.4.24"
      }
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    goerli: {
      chainId: 5,
      url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY!],
    },
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY!
    }
  }
};

export default config;
