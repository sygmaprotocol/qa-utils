/* eslint-disable */ 
import { Environment, EthereumConfig, EvmResource, Substrate, SubstrateConfig } from '@buildwithsygma/sygma-sdk-core'
import { Wallet, providers } from 'ethers'
import { RpcEndpoints } from '../../types'
import { KeyringPair,  } from '@polkadot/keyring/types'
import { initSubstrateProvider } from '.'
import { fetchTokenAmount, waitUntilBridgedFungibleEvm } from '../helpers'
import { print } from 'gluegun'
const DEPOSIT_AMOUNT = '3000000000000000000';
const DEPOSIT_AMOUNT_TNT = '3000000000000000000'   // 18 decimals 000000000000000000
const DEPOSIT_AMOUNT_USDC = '3000000'   // 6 decimals 000000
const DEPOSIT_AMOUNT_PHA = '3000000000000'   // 12 decimals 000000000000


export async function testSubstrateToEvmRoutes(
  ethereumConfigs: Array<EthereumConfig>,
  SubstrateConfig: Array<SubstrateConfig>,
  rpcEndpoints: RpcEndpoints,
  evmWallet: Wallet,
  substrateWallet: KeyringPair,
  environment: Environment
): Promise<string> {
  let result = ""
  Promise.all(
    //SUBSTRATE -> EVM
    SubstrateConfig.map(async (network) => {
      const api = await initSubstrateProvider(rpcEndpoints, network)
      const functionCalls = [] as any
      
      for (const resource of network.resources) {
        for (const destinationDomain of ethereumConfigs) {
          const destinationProvider = new providers.JsonRpcProvider(rpcEndpoints[destinationDomain.chainId])
          evmWallet = new Wallet(evmWallet.privateKey, destinationProvider)
          if (destinationDomain.id !== network.id) {
            for (const destinationResource of destinationDomain.resources as unknown as Array<EvmResource>) {

              if (destinationResource.resourceId === resource.resourceId) {
                const assetTransfer = new Substrate.SubstrateAssetTransfer()

                await assetTransfer.init(
                  api as unknown as any,
                  environment
                )

                const transfer = await assetTransfer.createFungibleTransfer(
                  substrateWallet.address,
                  destinationDomain.chainId,
                  await evmWallet.getAddress(),
                  resource.resourceId,
                  DEPOSIT_AMOUNT
                )

                const fee = await assetTransfer.getFee(transfer)
                const transferTx =
                  await assetTransfer.buildTransferTransaction(
                    transfer,
                    fee
                  )
                const valueBefore = await fetchTokenAmount(
                  destinationProvider as unknown as any,
                  await evmWallet.getAddress(),
                  destinationResource.address
                )

                const unsub = await transferTx.signAndSend(
                  substrateWallet.address,
                  ({ status }) => {
                    print.debug(`Current status is ${status.toString()}`)

                    if (status.isInBlock) {
                      print.debug(
                        `Transaction included at blockHash ${status.asInBlock.toString()}`
                      )
                    } else if (status.isFinalized) {
                      print.debug(
                        `Transaction finalized at blockHash ${status.asFinalized.toString()}`
                      )

                      unsub()
                    }
                  }
                )
                const loggingData = {
                  resourceId: resource.resourceId,
                  sourceDomainId: network.id,
                  sourceDomainName: network.name,
                  destinationDomainId: destinationDomain.id,
                  destinationDomainName: destinationDomain.name
                }
                functionCalls.push(waitUntilBridgedFungibleEvm(
                  loggingData,
                  result,
                  valueBefore,
                  await evmWallet.getAddress(),
                  destinationResource.address,
                  destinationProvider as unknown as any
                ))
              }
            }
          }
        }
      }
      result += (await Promise.all(functionCalls)).join("\n")
    })
  )
  return result
}

export async function testCustomSubstrateToEvmRoutes(
  ethereumConfigs: Array<EthereumConfig>,
  SubstrateConfig: Array<SubstrateConfig>,
  rpcEndpoints: RpcEndpoints,
  evmWallet: Wallet,
  substrateWallet: KeyringPair,
  environment: Environment
): Promise<string> {
  let result = ""
    //SUBSTRATE -> EVM
    console.log("Started Transfer")
    for (let network of SubstrateConfig) {
      const api = await initSubstrateProvider(rpcEndpoints, network)
      const functionCalls = [] as any
      for (const resource of network.resources) {
        for (const destinationDomain of ethereumConfigs) {
          const destinationProvider = new providers.JsonRpcProvider(rpcEndpoints[destinationDomain.chainId])
          evmWallet = new Wallet(evmWallet.privateKey, destinationProvider)
          if (destinationDomain.id !== network.id) {
            for (const destinationResource of destinationDomain.resources as unknown as Array<EvmResource>) {
              if (destinationResource.resourceId === resource.resourceId) {
                const assetTransfer = new Substrate.SubstrateAssetTransfer()
                await assetTransfer.init(
                  api as unknown as any,
                  environment
                )

                let deposit_amount = '0'
                if (resource.symbol === "tTNT")
                  deposit_amount = DEPOSIT_AMOUNT_TNT
                else if (resource.symbol === "sygUSD")
                  deposit_amount = DEPOSIT_AMOUNT_USDC
                else if (resource.symbol === "PHA")
                  deposit_amount = DEPOSIT_AMOUNT_PHA

                console.log("Substrate wallet address: ", substrateWallet.address)
                console.log("Source Network ID: ", network.id)
                console.log("Dest Chain ID: ", destinationDomain.chainId)
                console.log("Dest wallet address: ", await evmWallet.getAddress())
                console.log("Resource ID: ", resource.resourceId)
                console.log("Deposit Amount: ", deposit_amount)
                console.log("Ress ID Symbol: ", resource.symbol)
                console.log("Ress ID Decimals: ", resource.decimals)

                const transfer = await assetTransfer.createFungibleTransfer(
                  substrateWallet.address,
                  destinationDomain.chainId,
                  await evmWallet.getAddress(),
                  resource.resourceId,
                  deposit_amount
                )


                const fee = await assetTransfer.getFee(transfer)
                console.log("Fee is", fee.fee.toNumber())
                const transferTx =
                   assetTransfer.buildTransferTransaction(
                    transfer,
                    fee
                  )

                const valueBefore = await fetchTokenAmount(
                  destinationProvider as unknown as any,
                  await evmWallet.getAddress(),
                  destinationResource.address
                )

                console.log("Value Before", valueBefore.toString())

                const unsub = await transferTx.signAndSend(
                  substrateWallet,
                  ({ status }) => {
                    print.debug(`Current status is ${status.toString()}`)
                    if (status.isInBlock) {
                      print.debug(
                        `Transaction included at blockHash ${status.asInBlock.toString()}`
                      )
                    } else if (status.isFinalized) {
                      print.debug(
                        `Transaction finalized at blockHash ${status.asFinalized.toString()}`
                      )

                      unsub()
                    }
                  }
                )

                console.log("After signAndSend")

                const loggingData = {
                  resourceId: resource.resourceId,
                  sourceDomainId: network.id,
                  sourceDomainName: network.name,
                  destinationDomainId: destinationDomain.id,
                  destinationDomainName: destinationDomain.name
                }

                functionCalls.push(await waitUntilBridgedFungibleEvm(
                  loggingData,
                  result,
                  valueBefore,
                  await evmWallet.getAddress(),
                  destinationResource.address,
                  destinationProvider as unknown as any
                ))
                console.log("validated")
              }
            }
          }
        }
      }
      result += (await Promise.all(functionCalls)).join("\n")
    }
  
  return result
}