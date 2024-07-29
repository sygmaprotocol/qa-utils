/* eslint-disable */ 
import { KeyringPair } from '@polkadot/keyring/types'
import { GluegunToolbox, filesystem, print } from 'gluegun'
import {
  EthereumConfig,
  Network,
  SubstrateConfig,
} from '@buildwithsygma/sygma-sdk-core'
import { Wallet } from 'ethers'
import { InitializedWallets, RpcEndpoints } from '../../types'
import { testCustomSubstrateToEvmRoutes } from '../../utils'

//./bin/maintenance-utils bridge only-substrate-evm --env testnet --srcDom 12 --destDom 2

module.exports = {
  name: 'only-substrate-evm',
  run: async (toolbox: GluegunToolbox) => {
    const { sharedConfig, wallet, parameters} = toolbox


    const rawConfig = await sharedConfig.fetchSharedConfig()

    //Set the default flag behavior for domains
    let srcSubDomains: number[] = [] // provide 2, 5, 6, 7, 8, 9 ex domain IDs
    if (typeof parameters.options.srcDom !== 'string' && typeof parameters.options.srcDom !== 'number') {
        srcSubDomains = [3, 12]
    } else if (typeof parameters.options.srcDom === 'number' ) {
        srcSubDomains.push(parameters.options.srcDom)
    } else {
        srcSubDomains = parameters.options.srcDom.split(',').map(Number)
    }

    
    let destEvemDom: number [] = [];
    if (typeof parameters.options.destDom !== 'string' && typeof parameters.options.destDom !== 'number') {
        destEvemDom = [2, 5, 6, 8, 9, 10, 11, 12]
      } else if (typeof parameters.options.destDom === 'number' ) {
        destEvemDom.push(parameters.options.destDom)
      } else {
        destEvemDom = parameters.options.destDom.split(',').map(Number)
      }

    const { env } = toolbox
    const initializedWallets = (await wallet.initializeWallets(
      rawConfig.domains
    )) as InitializedWallets

   

    const evmNetworks = rawConfig.domains.filter(
      (domain) => (domain.type === Network.EVM && destEvemDom.includes(domain.id))
    ) as Array<EthereumConfig>


    const substrateNetworks = rawConfig.domains.filter(
      (domain) => (domain.type === Network.SUBSTRATE && srcSubDomains.includes(domain.id))
    ) as Array<SubstrateConfig>


    // console.log("ETH Networks", evmNetworks);
    // console.log("Substrate Networks", substrateNetworks);

    const rpcEndpoints = filesystem.read(
      'rpcEndpoints.json',
      'json'
    ) as RpcEndpoints

    const substrateResult = await testCustomSubstrateToEvmRoutes(
      evmNetworks,
      substrateNetworks,
      rpcEndpoints,
      initializedWallets[Network.EVM] as Wallet,
      initializedWallets[Network.SUBSTRATE] as unknown as KeyringPair,
      env
    )

    print.info(substrateResult)
  },
}
