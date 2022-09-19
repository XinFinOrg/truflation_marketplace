// deploy baseline operator with tfitokens

import { ethers } from 'hardhat'
import { address } from './config'

async function main (): void {
  const name = 'ApiClient'
  const contract = await ethers.getContractFactory(name)
  const inst = await contract.deploy(
    address.operator_baseline,
    address.jobid_baseline,
    '0',
    address.token_tfi
  )

  await inst.deployed()
  console.log(`${name} deployed to ${inst.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
