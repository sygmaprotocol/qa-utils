/* eslint-disable */ 
import {
  EVMAssetTransfer,
  Environment,
  EthereumConfig,
  EvmResource,
  SubstrateConfig,
  ResourceType
} from '@buildwithsygma/sygma-sdk-core'
import { Wallet, providers } from 'ethers'
import { KeyringPair } from '@polkadot/keyring/types'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { AccountInfo } from '@polkadot/types/interfaces'
import { print } from 'gluegun'
import { RpcEndpoints } from '../../types'
import { LoggingData, sleep } from '../helpers'
import * as dotenv from 'dotenv'

dotenv.config();

const DEPOSIT_AMOUNT = process.env.TRANSFER_AMOUNT_EVM || ""

export async function testEvmToSubstrateRoutes(
  ethereumConfigs: Array<EthereumConfig>,
  SubstrateConfig: Array<SubstrateConfig>,
  rpcEndpoints: RpcEndpoints,
  evmWallet: Wallet,
  substrateWallet: KeyringPair,
  environment: Environment,
): Promise<string> {
  let result = ""
  for (const network of ethereumConfigs) {
    const sourceProvider = new providers.JsonRpcProvider(rpcEndpoints[network.chainId])
    evmWallet = new Wallet(evmWallet.privateKey, sourceProvider)
    const functionCalls = [] as any

    for (const resource of network.resources) {
      for (const destinationDomain of SubstrateConfig) {
        const loggingData = {
          resourceId: resource.resourceId,
          sourceDomainId: network.id,
          sourceDomainName: network.name,
          destinationDomainId: destinationDomain.id,
          destinationDomainName: destinationDomain.name
        }
        try {
          const destinationProvider = new WsProvider(rpcEndpoints[destinationDomain.chainId])
          const api = await ApiPromise.create({
            provider: destinationProvider
          })
          for (const destinationResource of destinationDomain.resources as unknown as Array<EvmResource>) {
            if (destinationResource.resourceId === resource.resourceId) {
              const assetTransfer = new EVMAssetTransfer()

              await assetTransfer.init(
                sourceProvider as providers.BaseProvider,
                Environment[environment]
              )

              const transfer = await assetTransfer.createFungibleTransfer(
                await evmWallet.getAddress(),
                destinationDomain.chainId,
                substrateWallet.address,
                resource.resourceId,
                DEPOSIT_AMOUNT
              )

              const fee = await assetTransfer.getFee(transfer)
              const approvals = await assetTransfer.buildApprovals(
                transfer,
                fee
              )

              for (const approval of approvals) {
                await evmWallet.sendTransaction(
                  approval as providers.TransactionRequest
                )
              }

              const transferTx =
                await assetTransfer.buildTransferTransaction(
                  transfer,
                  fee
                )
              await evmWallet.sendTransaction(
                transferTx as providers.TransactionRequest
              )

              const valueBefore = (
                await api.query.system.account<AccountInfo>(
                  substrateWallet.address
                )
              ).data.free

              functionCalls.push(waitUntilBridgedFungibleSubstrate(
                loggingData,
                result,
                valueBefore.toHuman(),
                api,
                substrateWallet.address
              ))
            }
          }
        } catch (err) {
          print.error(err)
          result += `\n resource ${loggingData.resourceId} unable to bridged from domain ${loggingData.sourceDomainId}(${loggingData.sourceDomainName}) to domain ${loggingData.destinationDomainId}(${loggingData.destinationDomainName}) - FAILED \n`
        }
      }
    }
    result += (await Promise.all(functionCalls)).join("\n")
  }
  return result
}

export async function testSourceEvmToSubstrateRoutes(
  ethereumConfigs: Array<EthereumConfig>,
  SubstrateConfig: Array<SubstrateConfig>,
  rpcEndpoints: RpcEndpoints,
  evmWallet: Wallet,
  substrateWallet: KeyringPair,
  environment: Environment,
  sourceDomainId: number[],
): Promise<string> {
  let result = ""
  for (const network of ethereumConfigs) {
    if(sourceDomainId.includes(network.id)) {
    const sourceProvider = new providers.JsonRpcProvider(rpcEndpoints[network.chainId])
    evmWallet = new Wallet(evmWallet.privateKey, sourceProvider)
    const functionCalls = [] as any

    for (const resource of network.resources) {
      if(resource.type === ResourceType.FUNGIBLE) {
      for (const destinationDomain of SubstrateConfig) {
        const loggingData = {
          resourceId: resource.resourceId,
          sourceDomainId: network.id,
          sourceDomainName: network.name,
          destinationDomainId: destinationDomain.id,
          destinationDomainName: destinationDomain.name
        }
        try {
          const destinationProvider = new WsProvider(rpcEndpoints[destinationDomain.chainId])
          const api = await ApiPromise.create({
            provider: destinationProvider
          })
          for (const destinationResource of destinationDomain.resources as unknown as Array<EvmResource>) {
            if (destinationResource.resourceId === resource.resourceId) {
              const assetTransfer = new EVMAssetTransfer()

              await assetTransfer.init(
                sourceProvider as providers.BaseProvider,
                Environment[environment]
              )

              const transfer = await assetTransfer.createFungibleTransfer(
                await evmWallet.getAddress(),
                destinationDomain.chainId,
                substrateWallet.address,
                resource.resourceId,
                DEPOSIT_AMOUNT
              )

              const fee = await assetTransfer.getFee(transfer)
              const approvals = await assetTransfer.buildApprovals(
                transfer,
                fee
              )

              for (const approval of approvals) {
                await evmWallet.sendTransaction(
                  approval as providers.TransactionRequest
                )
              }

              const transferTx =
                await assetTransfer.buildTransferTransaction(
                  transfer,
                  fee
                )
              await evmWallet.sendTransaction(
                transferTx as providers.TransactionRequest
              )

              const valueBefore = (
                await api.query.system.account<AccountInfo>(
                  substrateWallet.address
                )
              ).data.free

              functionCalls.push(waitUntilBridgedFungibleSubstrate(
                loggingData,
                result,
                valueBefore.toHuman(),
                api,
                substrateWallet.address
              ))
            }
          }
        } catch (err) {
          print.error(err)
          result += `\n resource ${loggingData.resourceId} unable to bridged from domain ${loggingData.sourceDomainId}(${loggingData.sourceDomainName}) to domain ${loggingData.destinationDomainId}(${loggingData.destinationDomainName}) - FAILED \n`
        }
      }
    }   
    }
    result += (await Promise.all(functionCalls)).join("\n")
  }
  }
  return result
}

const waitUntilBridgedFungibleSubstrate = async (
  loggingData: LoggingData,
  result: string,
  valueBefore: string,
  api: ApiPromise,
  account: string,
  intervalDuration: number = 120000,
  attempts: number = 5
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    let i = 0
    let valueAfter: string
    for (; ;) {
      await sleep(intervalDuration)
      valueAfter = (
        await api.query.system.account<AccountInfo>(account)
      ).data.free.toHuman()
      if (valueAfter !== valueBefore) {
        print.info('Transaction successfully bridged.' + JSON.stringify(loggingData))
        result = `resource ${loggingData.resourceId} succesfully bridged from domain ${loggingData.sourceDomainId}(${loggingData.sourceDomainName}) to domain ${loggingData.destinationDomainId}(${loggingData.destinationDomainName}) - PASSED`
        resolve(result);
        return;
      }
      i++
      if (i > attempts) {
        // transaction should have been bridged already
        print.info('transaction is taking too much time to bridge!' + JSON.stringify(loggingData))
        result = `resource ${loggingData.resourceId} unable to bridged from domain ${loggingData.sourceDomainId}(${loggingData.sourceDomainName}) to domain ${loggingData.destinationDomainId}(${loggingData.destinationDomainName}) - FAILED \n`
        resolve(result);
        return;
      }
    }
  })
}