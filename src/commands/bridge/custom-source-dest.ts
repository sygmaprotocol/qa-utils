/* eslint-disable */ 
import { GluegunToolbox, filesystem, print } from 'gluegun'
import {
  EthereumConfig,
  Network
} from '@buildwithsygma/sygma-sdk-core'
import { Wallet } from 'ethers'
import { InitializedWallets, RpcEndpoints } from '../../types'
import {testCustomSourceToCustomDest } from '../../utils/evm/testEVMToEVMRoutes'

// STILL IN PROGRESS ( not fully tested) ( ressid not added yet)
// Flags: env -> local, devnet, testnet, mainnet domains -> 2, 5, 6, 7, 8, 9, 10 |  resource -> Fungible, GMP, NonFungible, PermissionedGeneric
// Ex of use -> ./bin/maintenance-utils bridge custom-source-dest --sdomains 2 --ddomains 9,10 --resource GMP  
module.exports = {
  name: 'custom-source-dest',
  run: async (toolbox: GluegunToolbox) => {
    const { sharedConfig, wallet, depositAmount, path, parameters } = toolbox

    
    const rawConfig = await sharedConfig.fetchSharedConfig()


    const resourceId_testnet = ['0x0000000000000000000000000000000000000000000000000000000000000200', '0x0000000000000000000000000000000000000000000000000000000000000300','0x0000000000000000000000000000000000000000000000000000000000000500',
                                '0x0000000000000000000000000000000000000000000000000000000000000600', '0x0000000000000000000000000000000000000000000000000000000000001100', '0x0000000000000000000000000000000000000000000000000000000000001000']
    let testSourceDomainIDs: number[] = [] // provide 2, 5, 6, 7, 8, 9 ex domain IDs
    let testResrouceType: string = '' //Values: Fungible, GMP, NonFungible, PermissionedGeneric
    let testDestDomainIDs: number[] = [] // provide 2, 5, 6, 7, 8, 9 ex domain IDs
    
    //Set the default flag behavior for domains
    if (typeof parameters.options.sdomains !== 'string' && typeof parameters.options.sdomains !== 'number') {
        testSourceDomainIDs = [2, 5, 6, 7, 8, 9, 10]
    } else if (typeof parameters.options.sdomains === 'number' ) {
        testSourceDomainIDs.push(parameters.options.sdomains)
    } else {
        testSourceDomainIDs = parameters.options.sdomains.split(',').map(Number)
    }

    if (typeof parameters.options.ddomains !== 'string' && typeof parameters.options.ddomains !== 'number') {
        testDestDomainIDs = [2, 5, 6, 7, 8, 9, 10]
    } else if (typeof parameters.options.ddomains === 'number' ) {
        testDestDomainIDs.push(parameters.options.ddomains)
    } else {
        testDestDomainIDs = parameters.options.ddomains.split(',').map(Number)
    }

    console.log("TEST sdomains ",parameters.options.sdomains)
    console.log("TEST ddomains ",parameters.options.ddomains)

    console.log("TEST SOURCE DOMAINS",testSourceDomainIDs)
    console.log("TEST DEST DOMAINS",testDestDomainIDs)

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

        const customSourceToCustomDest =  await testCustomSourceToCustomDest(
            evmNetworks,
            rpcEndpoints,
            initializedWallets[Network.EVM] as Wallet,
            env,
            amount,
            executionContractAddress,
            testSourceDomainIDs,
            testDestDomainIDs,
            testResrouceType,
            resourceId_testnet
          )


      print.info(customSourceToCustomDest)
   }
}
