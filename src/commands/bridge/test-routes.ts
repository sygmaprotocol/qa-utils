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

import { testEvmToEvmRoutes } from '../../utils/evm/testEVMToEVMRoutes'
import { testEvmToSubstrateRoutes } from '../../utils/evm/testEVMToSubstrateRoutes'
import { testSubstrateToEvmRoutes } from '../../utils'

module.exports = {
  name: 'test-routes',
  run: async (toolbox: GluegunToolbox) => {
    const { sharedConfig, wallet, depositAmount, path} = toolbox

    const rawConfig = await sharedConfig.fetchSharedConfig()

    const { env } = toolbox
    const initializedWallets = (await wallet.initializeWallets(
      rawConfig.domains
    )) as InitializedWallets

    const evmNetworks = rawConfig.domains.filter(
      (domain) => domain.type === Network.EVM
    ) as Array<EthereumConfig>

    const substrateNetworks = rawConfig.domains.filter(
      (domain) => domain.type === Network.SUBSTRATE
    ) as Array<SubstrateConfig>

    const rpcEndpoints = filesystem.read(
      'rpcEndpoints.json',
      'json'
    ) as RpcEndpoints

    let amount = await depositAmount.getDepositAmount()
    const executionContractAddressesPath = await path.getGenericHandlerTestingContractAddresses()

    const executionContractAddress = filesystem.read(
      executionContractAddressesPath,
      'json'
    )

    const evmToEvmResult = await testEvmToEvmRoutes(
      evmNetworks,
      rpcEndpoints,
      initializedWallets[Network.EVM] as Wallet,
      env,
      amount,
      executionContractAddress
    )
    const evmToSubstrateResult = await testEvmToSubstrateRoutes(
      evmNetworks,
      substrateNetworks,
      rpcEndpoints,
      initializedWallets[Network.EVM] as Wallet,
      initializedWallets[Network.SUBSTRATE] as unknown as KeyringPair,
      env
    )
    const substrateResult = await testSubstrateToEvmRoutes(
      evmNetworks,
      substrateNetworks,
      rpcEndpoints,
      initializedWallets[Network.EVM] as Wallet,
      initializedWallets[Network.SUBSTRATE] as unknown as KeyringPair,
      env
    )

    print.info(evmToEvmResult + evmToSubstrateResult + substrateResult)
  },
}
