/* eslint-disable */ 
import { GluegunToolbox, filesystem, print } from 'gluegun'
import {
  EthereumConfig,
  Network,
} from '@buildwithsygma/sygma-sdk-core'
import { Wallet } from 'ethers'
import { InitializedWallets, RpcEndpoints } from '../../types'

import {onlySourceCustom, onlyDestinationCustom } from '../../utils/evm/testEVMToEVMRoutes'

// Flags: env -> local, devnet, testnet, mainnet domains -> 2, 5, 6, 7, 8, 9 |  resource -> Fungible, GMP, NonFungible, PermissionedGeneric
module.exports = {
  name: 'custom-evm-tests',
  run: async (toolbox: GluegunToolbox) => {
    const { sharedConfig, wallet, depositAmount, path, parameters } = toolbox

    
    const rawConfig = await sharedConfig.fetchSharedConfig()

    const resourceId_testnet = ['0x0000000000000000000000000000000000000000000000000000000000000200', '0x0000000000000000000000000000000000000000000000000000000000000300','0x0000000000000000000000000000000000000000000000000000000000000500',
                                '0x0000000000000000000000000000000000000000000000000000000000000600', '0x0000000000000000000000000000000000000000000000000000000000001100', '0x0000000000000000000000000000000000000000000000000000000000001000']
    let testDomainIDs: number[] = [] // provide 2, 5, 6, 7, 8, 9 ex domain IDs
    let testResrouceType: string = '' //Values: Fungible, GMP, NonFungible, PermissionedGeneric
    
    //Set the default flag behavior for domains
    if (typeof parameters.options.domains !== 'string') {
      testDomainIDs = [2, 5, 6, 7, 8, 9]
    } else if (parameters.options.domains.length === 1) {
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
  
      print.info(onlySourceAllResult + onlyDestinationAllResult)
   }
}
