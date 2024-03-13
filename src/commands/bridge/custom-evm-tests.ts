import { GluegunToolbox, filesystem, print } from 'gluegun'
import {
  EthereumConfig,
  Network
} from '@buildwithsygma/sygma-sdk-core'
import { Wallet } from 'ethers'
import { InitializedWallets, RpcEndpoints } from '../../types'

import {onlySourceCustom, onlyDestinationCustom } from '../../utils/evm/testEVMToEVMRoutes'

// This Module can test one; multiple; or ALL domain IDs and only 1 Resource TYPE ( but all IDs)
module.exports = {
  name: 'custom-evm-tests',
  run: async (toolbox: GluegunToolbox) => {
    const { sharedConfig, wallet, depositAmount, path, parameters} = toolbox

    let testDomainIDs: number[] = [] // provide 1,2,3,4 ex domain IDs
    let testResrouceType: string = '' //Values: Fungible, GMP, NonFungible, PermissionedGeneric

    if (parameters.options.domains.length == 1) {
      testDomainIDs.push(+parameters.options.domains)
    } else if (parameters.options.domains.length > 1) {
      testDomainIDs = parameters.options.domains.split(',').map(Number)
    } else {
        testDomainIDs = [2, 3, 5, 6, 7, 8, 9]
    }

    if(parameters.options.resource.length > 1) {
        testResrouceType = parameters.options.resource; 
    } else {
        testResrouceType = 'GMP'
    }

    // console.log("This is parameters.domains options: ", testDomainIDs)
    // console.log("This is parameters.resrource options: ", testResrouceType)

    const rawConfig = await sharedConfig.fetchSharedConfig()

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
    const executionContractAddressesPath =
      await path.getGenericHandlerTestingContractAddresses()

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
        testResrouceType
      )

      const onlyDestinationAllResult = await onlyDestinationCustom(
        evmNetworks,
        rpcEndpoints,
        initializedWallets[Network.EVM] as Wallet,
        env,
        amount,
        executionContractAddress,
        testDomainIDs,
        testResrouceType
      )
  
      print.info(onlySourceAllResult + onlyDestinationAllResult)
  },
}
