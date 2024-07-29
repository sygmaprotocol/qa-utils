/* eslint-disable */ 
import {
  EthereumConfig,
  Network,
  SubstrateConfig,
} from '@buildwithsygma/sygma-sdk-core'
import { Wallet } from 'ethers'
import { GluegunToolbox /*prompt*/ } from 'gluegun'
import { Keyring } from '@polkadot/api'
import { InitializedWallets, BalanceConfig } from '../types'
import * as dotenv from 'dotenv'

dotenv.config();

module.exports = (toolbox: GluegunToolbox) => {
  async function initializeWallets(
    config: Array<EthereumConfig | SubstrateConfig | BalanceConfig>
  ): Promise<InitializedWallets> {
    // get only single unique network type values from config
    const networkTypes: string[] = Array.from(
      new Set(config.map((domain) => domain.type))
    )

    const wallets: InitializedWallets = {} as unknown as InitializedWallets
    for await (const networkType of networkTypes) {
      const PRIVATE_KEY_OR_MNEMONIC_EVM = process.env.PRIVATE_KEY_OR_MNEMONIC_EVM || ""; 
      const MNEMONIC_SUBSTRATE: string = process.env.MNEMONIC_SUBSTRATE || "";
      // const result = await prompt.ask([
      //   {
      //     type: 'input',
      //     name: 'initWallet',
      //     message: `Enter wallet mnemonic or private key for ${networkType} network`,
      //   },
      // ])
      try{
      switch (networkType) {
        case Network.EVM: {
          // check if private key (len = 1) or mnemonic (len > 1) was provided
          const inputString = PRIVATE_KEY_OR_MNEMONIC_EVM.split(' ')
          if (inputString.length > 1) {
            wallets[Network.EVM] = Wallet.fromMnemonic(PRIVATE_KEY_OR_MNEMONIC_EVM)
            console.log("EVM wallet is set!",wallets[Network.EVM].address)
          } 
          else {
            wallets[Network.EVM] = new Wallet(PRIVATE_KEY_OR_MNEMONIC_EVM)
            console.log("EVM wallet is set!",wallets[Network.EVM].address)
          }
          break
        }
        case Network.SUBSTRATE: {
          const keyring = new Keyring({ type: 'sr25519' })
          wallets[Network.SUBSTRATE] = keyring.addFromMnemonic(
            MNEMONIC_SUBSTRATE
          )
          console.log("Substrate wallet is set!",wallets[Network.SUBSTRATE].address )
          break
        }
        case "btc": {
          // method yet to be imp
          break;
        }
        default:
          throw new Error('Unsupported network, failed to initialize wallet.')
      } } catch(error) {
        if (error instanceof Error) 
          console.error('An error occurred:', error.message);
        else 
          console.log('An error occurred:', error)}
    }
    return wallets
  }
  toolbox.wallet = { initializeWallets }
}
