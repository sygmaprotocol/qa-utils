/* eslint-disable */ 
import { GluegunToolbox, filesystem, print } from 'gluegun'
// import { KeyringPair } from '@polkadot/keyring/types'
import {
  EthereumConfig,
  Network,
  /*SubstrateConfig*/
} from '@buildwithsygma/sygma-sdk-core'
import { Wallet } from 'ethers'
import { InitializedWallets, RpcEndpoints } from '../../types'
import {onlySourceCustom, onlyDestinationCustom } from '../../utils/evm/testEVMToEVMRoutes'
// import {testSourceEvmToSubstrateRoutes} from "../../utils/evm/testEVMToSubstrateRoutes"

// Flags: env -> local, devnet, testnet, mainnet domains -> 2, 5, 6, 7, 8, 9 |  resource -> Fungible, GMP, NonFungible, PermissionedGeneric | ressid -> 200, 600, 300, 500, 600, 1000, 1100
// EX of use -> ./bin/maintenance-utils bridge custom-ressid-evm --resource Fungible --ressid 300
module.exports = {
  name: 'custom-ressid-evm',
  run: async (toolbox: GluegunToolbox) => {
    const { sharedConfig, wallet, depositAmount, path, parameters } = toolbox
    
    const rawConfig = await sharedConfig.fetchSharedConfig()
    // const substrateNetworks = rawConfig.domains.filter(
    //   (domain) => domain.type === Network.SUBSTRATE
    // ) as Array<SubstrateConfig>

    let testDomainIDs: number[] = [] // provide 2, 5, 6, 7, 8, 9 ex domain IDs
    let testResrouceType: string = '' //Values: Fungible, GMP, NonFungible, PermissionedGeneric
    let resourceId_testnet: string[] = []; // Values from ress id: 200, 600, 300, 500, 600, 1000, 1100

    if (typeof parameters.options.ressid !== 'number' ){
        resourceId_testnet = ['0x0000000000000000000000000000000000000000000000000000000000000200', '0x0000000000000000000000000000000000000000000000000000000000000300','0x0000000000000000000000000000000000000000000000000000000000000500',
                                '0x0000000000000000000000000000000000000000000000000000000000000600', '0x0000000000000000000000000000000000000000000000000000000000001100', '0x0000000000000000000000000000000000000000000000000000000000001000']
    } else if (parameters.options.ressid < 1000) {
        resourceId_testnet.push(`0x0000000000000000000000000000000000000000000000000000000000000${parameters.options.ressid}`) 
      }
        else {
          resourceId_testnet.push(`0x000000000000000000000000000000000000000000000000000000000000${parameters.options.ressid}`)
        }

    console.log("This is from original FILE resourceId_testnet", resourceId_testnet)

    //Set the default flag behavior for domains
    if (typeof parameters.options.domains !== 'string' && typeof parameters.options.domains !== 'number') {
      testDomainIDs = [2, 5, 6, 8, 9, 10, 11, 12]
    } else if (typeof parameters.options.domains === 'number') {
      testDomainIDs.push(+parameters.options.domains)
    } else {
      testDomainIDs = parameters.options.domains.split(',').map(Number)
    }

    //Set the default flag behavior for resource
    if(typeof parameters.options.resource !== 'string') {
      testResrouceType = 'GMP'
    } else {
        testResrouceType = parameters.options.resource;
    }



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

      const onlyDestinationAllResult = await onlyDestinationCustom(
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

      // const evmSourceToSubstrateDest = await testSourceEvmToSubstrateRoutes(
      //   evmNetworks,
      //   substrateNetworks,
      //   rpcEndpoints,
      //   initializedWallets[Network.EVM] as Wallet,
      //   initializedWallets[Network.SUBSTRATE] as unknown as KeyringPair,
      //   env,
      //   testDomainIDs
      // )
  
      print.info(onlySourceAllResult + onlyDestinationAllResult)
   }
}
