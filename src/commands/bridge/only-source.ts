/* eslint-disable */ 
import { GluegunToolbox, filesystem, print } from 'gluegun'
import { KeyringPair } from '@polkadot/keyring/types'
import {
  EthereumConfig,
  Network,
  SubstrateConfig
} from '@buildwithsygma/sygma-sdk-core'
import { Wallet } from 'ethers'
import { InitializedWallets, RpcEndpoints } from '../../types'
import {onlySourceCustom } from '../../utils/evm/testEVMToEVMRoutes'
import { testSourceEvmToSubstrateRoutes } from '../../utils/evm/testEVMToSubstrateRoutes'

// STILL IN PROGRESS ( not fully tested)
// Flags: env -> local, devnet, testnet, mainnet domains -> 2, 5, 6, 7, 8, 9, 10 |  resource -> Fungible, GMP, NonFungible, PermissionedGeneric
// Ex of use -> ./bin/maintenance-utils bridge only-source --domains 2 --resource Fungible
module.exports = {
  name: 'only-source',
  run: async (toolbox: GluegunToolbox) => {
    const { sharedConfig, wallet, depositAmount, path, parameters } = toolbox

    
    const rawConfig = await sharedConfig.fetchSharedConfig()

    const substrateNetworks = rawConfig.domains.filter(
      (domain) => domain.type === Network.SUBSTRATE
    ) as Array<SubstrateConfig>


    const resourceId_testnet = ['0x0000000000000000000000000000000000000000000000000000000000000200', '0x0000000000000000000000000000000000000000000000000000000000000300','0x0000000000000000000000000000000000000000000000000000000000000500',
                                '0x0000000000000000000000000000000000000000000000000000000000000600', '0x0000000000000000000000000000000000000000000000000000000000001100', '0x0000000000000000000000000000000000000000000000000000000000001000']
    let testDomainIDs: number[] = [] // provide 2, 5, 6, 7, 8, 9 ex domain IDs
    let testResrouceType: string = '' //Values: Fungible, GMP, NonFungible, PermissionedGeneric
    
    //Set the default flag behavior for domains
    console.log("PARAM DOMAINS",parameters.options.domains)
    console.log("PARAM DOMAINS LENGHT",parameters.options.domains.length)
    console.log("PARAM DOMAINS type", typeof parameters.options.domains)
    if (typeof parameters.options.domains !== 'string' && typeof parameters.options.domains !== 'number') {
      testDomainIDs = [2, 5, 6, 7, 8, 9, 10]
    } else if (typeof parameters.options.domains === 'number' ) {
      testDomainIDs.push(parameters.options.domains)
    } else {
      testDomainIDs = parameters.options.domains.split(',').map(Number)
    }

    console.log("TEST DOMAINS",testDomainIDs)

    //Set the default flag behavior for resource
    if(typeof parameters.options.resource !== 'string') {
      testResrouceType = 'GMP'
    } else {
        testResrouceType = parameters.options.resource;
    }

    // console.log("This is parameters.domains options: ", testDomainIDs)
    // console.log("This is parameters.resrource options: ", testResrouceType)

    const { env } = toolbox
    const initializedWallets = (await wallet.initializeWallets(
      rawConfig.domains
    )) as InitializedWallets

    const evmNetworks = rawConfig.domains.filter(
      (domain) => domain.type === Network.EVM
    ) as Array<EthereumConfig>

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

      const onlySourceAllResult = await onlySourceCustom(
        evmNetworks,
        rpcEndpoints,
        initializedWallets[Network.EVM] as Wallet,
        env,
        amount,
        executionContractAddress,
        testDomainIDs,
        testResrouceType,
        resourceId_testnet
      )

      const evmSourceToSubstrateDest = await testSourceEvmToSubstrateRoutes(
        evmNetworks,
        substrateNetworks,
        rpcEndpoints,
        initializedWallets[Network.EVM] as Wallet,
        initializedWallets[Network.SUBSTRATE] as unknown as KeyringPair,
        env,
        testDomainIDs
      )
  

      print.info(onlySourceAllResult + evmSourceToSubstrateDest)
   }
}
