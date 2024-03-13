
import { EVMAssetTransfer, EVMGenericMessageTransfer, Environment, EthereumConfig, EvmResource, Resource, ResourceType } from '@buildwithsygma/sygma-sdk-core'
import { BigNumber, Wallet, providers, utils } from 'ethers'
import { RpcEndpoints } from '../../types'

import { Storage__factory } from '../Contracts'
import { LoggingData, fetchTokenAmount, sleep, waitUntilBridgedFungibleEvm } from '../helpers'
import { print } from 'gluegun'

type ExecutionContractAddress = {
  [key: string]: string
}

const EXECUTE_FUNCTION_SIGNATURE = '0xa271ced2'
const MAX_FEE = '500000' // for GMP
export async function testEvmToEvmRoutes(
  ethereumConfigs: Array<EthereumConfig>,
  rpcEndpoints: RpcEndpoints,
  evmWallet: Wallet,
  environment: Environment,
  depositAmount: string,
  executionContractAddress: ExecutionContractAddress
): Promise<string> {
  let result = ""
  for (const network of ethereumConfigs) {
    const sourceProvider = new providers.JsonRpcProvider(rpcEndpoints[network.chainId])
    evmWallet = new Wallet(evmWallet.privateKey, sourceProvider)
    const functionCalls = [] as any

    for (const resource of network.resources) {
      for (const destinationDomain of ethereumConfigs) {
        const loggingData = {
          resourceId: resource.resourceId,
          sourceDomainId: network.id,
          sourceDomainName: network.name,
          destinationDomainId: destinationDomain.id,
          destinationDomainName: destinationDomain.name
        }
        try {
          const destinationProvider = new providers.JsonRpcProvider(rpcEndpoints[destinationDomain.chainId])

          if (destinationDomain.id == network.id) {
            continue
          }

          for (const destinationResource of destinationDomain.resources as unknown as Array<EvmResource>) {
            if (destinationResource.resourceId === resource.resourceId) {
              switch (resource.type) {
                case ResourceType.FUNGIBLE:
                  const valueBefore = await fetchTokenAmount(
                    destinationProvider,
                    await evmWallet.getAddress(),
                    destinationResource.address
                  )

                  print.info(`Transfer ${depositAmount} ${resource.symbol} from domainID: ${network.id} to domainID: ${destinationDomain.id}`)
                  await makeFungibleTransfer(sourceProvider, environment, evmWallet, destinationDomain, resource, depositAmount)

                  functionCalls.push(waitUntilBridgedFungibleEvm(
                    loggingData,
                    result,
                    valueBefore,
                    await evmWallet.getAddress(),
                    destinationResource.address,
                    destinationProvider
                  ))
                  break
                case ResourceType.PERMISSIONLESS_GENERIC:
                  if(executionContractAddress[`EXECUTE_CONTRACT_ADDRESS_${destinationDomain.id}`]) {
                    const contractValueBefore = await fetchGenericContractValue(
                      executionContractAddress[`EXECUTE_CONTRACT_ADDRESS_${destinationDomain.id}`],
                      destinationProvider,
                      await evmWallet.getAddress()
                    )

                    print.info(`Transfer generic message (resource:${resource.resourceId}) from ${network.id} to ${destinationDomain.id}`)
                    await makeGenericTransfer(sourceProvider, environment, evmWallet, destinationDomain, resource, executionContractAddress)
                    
                    functionCalls.push(waitUntilBridgedGenericEvm(
                      loggingData,
                      result,
                      contractValueBefore,
                      executionContractAddress[`EXECUTE_CONTRACT_ADDRESS_${destinationDomain.id}`],
                      destinationProvider,
                      await evmWallet.getAddress()
                    ))
                  }
                  break
                case ResourceType.NON_FUNGIBLE:
                  print.warning("not implemented for type: " + ResourceType.NON_FUNGIBLE);
                  break;
                case ResourceType.PERMISSIONED_GENERIC:
                  print.warning(
                    'not implemented for type: ' + ResourceType.NON_FUNGIBLE
                  )
                  break
                default:
                  print.error(`INVALID RESOURCE TYPE`)
              }
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

export async function onlySourceCustom(
  ethereumConfigs: Array<EthereumConfig>, // checks shared config 
  rpcEndpoints: RpcEndpoints, //check local settup for RPC
  evmWallet: Wallet, // Signer - Provider capabilities
  environment: Environment, // checks env Setting
  depositAmount: string,
  executionContractAddress: ExecutionContractAddress, // check locl contract JSON
  sourceDomainId: number[],
  testResourceType: string
): Promise<string> {
  let result = ""
  for (const network of ethereumConfigs) {
    const functionCalls = [] as any
    if(sourceDomainId.includes(network.id)) {
    const sourceProvider = new providers.JsonRpcProvider(rpcEndpoints[network.chainId])
    evmWallet = new Wallet(evmWallet.privateKey, sourceProvider)

    for (const resource of network.resources) {
      for (const destinationDomain of ethereumConfigs) {
        const loggingData = {
          resourceId: resource.resourceId,
          sourceDomainId: network.id,
          sourceDomainName: network.name,
          destinationDomainId: destinationDomain.id,
          destinationDomainName: destinationDomain.name
        }
        try {
          const destinationProvider = new providers.JsonRpcProvider(rpcEndpoints[destinationDomain.chainId])

          if (destinationDomain.id == network.id) {
            continue
          }

          for (const destinationResource of destinationDomain.resources as unknown as Array<EvmResource>) {
            if (destinationResource.resourceId === resource.resourceId) {
              switch (testResourceType) {
                case "Fungible":
                  if(resource.type === ResourceType.FUNGIBLE) {
                  const valueBefore = await fetchTokenAmount(
                    destinationProvider,
                    await evmWallet.getAddress(),
                    destinationResource.address
                  )

                  print.info(`Transfer ${depositAmount} ${resource.symbol} from domainID: ${network.id} to domainID: ${destinationDomain.id}`)
                  await makeFungibleTransfer(sourceProvider, environment, evmWallet, destinationDomain, resource, depositAmount)

                  functionCalls.push(waitUntilBridgedFungibleEvm(
                    loggingData,
                    result,
                    valueBefore,
                    await evmWallet.getAddress(),
                    destinationResource.address,
                    destinationProvider
                  )) }
                  break
                case "GMP":
                  if(resource.type === ResourceType.PERMISSIONLESS_GENERIC) {
                  if(executionContractAddress[`EXECUTE_CONTRACT_ADDRESS_${destinationDomain.id}`]) {
                    const contractValueBefore = await fetchGenericContractValue(
                      executionContractAddress[`EXECUTE_CONTRACT_ADDRESS_${destinationDomain.id}`],
                      destinationProvider,
                      await evmWallet.getAddress()
                    )

                    print.info(`Transfer generic message (resource:${resource.resourceId}) from ${network.id} to ${destinationDomain.id}`)
                    await makeGenericTransfer(sourceProvider, environment, evmWallet, destinationDomain, resource, executionContractAddress)
                    
                    functionCalls.push(waitUntilBridgedGenericEvm(
                      loggingData,
                      result,
                      contractValueBefore,
                      executionContractAddress[`EXECUTE_CONTRACT_ADDRESS_${destinationDomain.id}`],
                      destinationProvider,
                      await evmWallet.getAddress()
                    ))
                  } }
                  break
                case "NonFungible":
                  print.warning("not implemented for type: " + ResourceType.NON_FUNGIBLE);
                  break;
                case "PermissionedGeneric":
                  print.warning(
                    'not implemented for type: ' + ResourceType.NON_FUNGIBLE
                  )
                  break
                default:
                  print.error(`INVALID RESOURCE TYPE`)
              }
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
  }
  return result
}

export async function onlyDestinationCustom(
  ethereumConfigs: Array<EthereumConfig>, // checks shared config 
  rpcEndpoints: RpcEndpoints, //check local settup for RPC
  evmWallet: Wallet, // Signer - Provider capabilities
  environment: Environment, // checks env Setting
  depositAmount: string,
  executionContractAddress: ExecutionContractAddress, // check locl contract JSON
  destinationDomainIDs: number[],
  testResourceType: string
): Promise<string> {
  let result = ""
  for (const network of ethereumConfigs) {
    if(!destinationDomainIDs.includes(network.id)) {
    const sourceProvider = new providers.JsonRpcProvider(rpcEndpoints[network.chainId])
    evmWallet = new Wallet(evmWallet.privateKey, sourceProvider)
    const functionCalls = [] as any

    for (const resource of network.resources) {
      for (const destinationDomain of ethereumConfigs) {
        const loggingData = {
          resourceId: resource.resourceId,
          sourceDomainId: network.id,
          sourceDomainName: network.name,
          destinationDomainId: destinationDomain.id,
          destinationDomainName: destinationDomain.name
        }
        try {
          const destinationProvider = new providers.JsonRpcProvider(rpcEndpoints[destinationDomain.chainId])

          if (destinationDomain.id == network.id) {
            continue
          }

          for (const destinationResource of destinationDomain.resources as unknown as Array<EvmResource>) {
            if (destinationResource.resourceId === resource.resourceId) {
              if(destinationDomainIDs.includes(destinationDomain.id)) {
              switch (testResourceType) {
                case "Fungible":
                  if (resource.type === ResourceType.FUNGIBLE) {
                  const valueBefore = await fetchTokenAmount(
                    destinationProvider,
                    await evmWallet.getAddress(),
                    destinationResource.address
                  )

                  print.info(`Transfer ${depositAmount} ${resource.symbol} from domainID: ${network.id} to domainID: ${destinationDomain.id}`)
                  await makeFungibleTransfer(sourceProvider, environment, evmWallet, destinationDomain, resource, depositAmount)

                  functionCalls.push(waitUntilBridgedFungibleEvm(
                    loggingData,
                    result,
                    valueBefore,
                    await evmWallet.getAddress(),
                    destinationResource.address,
                    destinationProvider
                  )) 
                  }
                  break
                case "GMP":
                  if (resource.type === ResourceType.PERMISSIONLESS_GENERIC) {
                  if(executionContractAddress[`EXECUTE_CONTRACT_ADDRESS_${destinationDomain.id}`]) {
                    const contractValueBefore = await fetchGenericContractValue(
                      executionContractAddress[`EXECUTE_CONTRACT_ADDRESS_${destinationDomain.id}`],
                      destinationProvider,
                      await evmWallet.getAddress()
                    )

                    print.info(`Transfer generic message (resource:${resource.resourceId}) from ${network.id} to ${destinationDomain.id}`)
                    await makeGenericTransfer(sourceProvider, environment, evmWallet, destinationDomain, resource, executionContractAddress)
                    
                    functionCalls.push(waitUntilBridgedGenericEvm(
                      loggingData,
                      result,
                      contractValueBefore,
                      executionContractAddress[`EXECUTE_CONTRACT_ADDRESS_${destinationDomain.id}`],
                      destinationProvider,
                      await evmWallet.getAddress()
                    ))
                  } }
                  break
                case "NonFungible":
                  print.warning("not implemented for type: " + ResourceType.NON_FUNGIBLE);
                  break;
                case "Permissioned_Generic":
                  print.warning(
                    'not implemented for type: ' + ResourceType.NON_FUNGIBLE
                  )
                  break
                default:
                  print.error(`INVALID RESOURCE TYPE`)
              }
            }
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
  }
  return result
}

async function makeFungibleTransfer(sourceProvider: providers.JsonRpcProvider, environment: Environment, evmWallet: Wallet, destinationDomain: EthereumConfig, resource: Resource, depositAmount: string) {
  const assetTransfer = new EVMAssetTransfer()
  await assetTransfer.init(
    sourceProvider as providers.BaseProvider,
    Environment[environment]
  )

  const transfer = await assetTransfer.createFungibleTransfer(
    await evmWallet.getAddress(),
    destinationDomain.chainId,
    await evmWallet.getAddress(),
    resource.resourceId,
    depositAmount
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
}

async function makeGenericTransfer(sourceProvider: providers.JsonRpcProvider, environment: Environment, evmWallet: Wallet, destinationDomain: EthereumConfig, resource: Resource, executionContractAddress: ExecutionContractAddress) {
  const messageTransfer = new EVMGenericMessageTransfer()

  await messageTransfer.init(
    sourceProvider as unknown as any,
    Environment[environment]
  )

  const EXECUTION_DATA = utils.defaultAbiCoder.encode(
    ['uint'],
    [Date.now()]
  )

  const genericTransfer = messageTransfer.createGenericMessageTransfer(
    await evmWallet.getAddress(),
    destinationDomain.chainId,
    resource.resourceId,
    executionContractAddress[`EXECUTE_CONTRACT_ADDRESS_${destinationDomain.id}`],
    EXECUTE_FUNCTION_SIGNATURE,
    EXECUTION_DATA,
    MAX_FEE
  )

  const genericFee = await messageTransfer.getFee(genericTransfer)
  const genericTransferTx =
    await messageTransfer.buildTransferTransaction(
      genericTransfer,
      genericFee
    )
  await evmWallet.sendTransaction(
    genericTransferTx as providers.TransactionRequest
  )
}

async function fetchGenericContractValue(
  executionContractAddress: string,
  destinationProvider: providers.Provider,
  depositor: string
): Promise<BigNumber> {
  const storageContract = Storage__factory.connect(
    executionContractAddress,
    destinationProvider
  )
  return await storageContract.retrieve(depositor)
}

const waitUntilBridgedGenericEvm = async (
  loggingData: LoggingData,
  result: string,
  valueBefore: BigNumber,
  executionContractAddress: string,
  destinationProvider: providers.Provider,
  depositor: string,
  intervalDuration: number = 120000,
  attempts: number = 5
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    let i = 0
    let valueAfter: BigNumber
    for (; ;) {
      await sleep(intervalDuration)
      valueAfter = await fetchGenericContractValue(
        executionContractAddress,
        destinationProvider,
        depositor
      )
      if (!valueAfter.eq(valueBefore)) {
        print.info('Transaction successfully bridged.' + JSON.stringify(loggingData))
        result = `resource ${loggingData.resourceId} succesfully bridged from domain ${loggingData.sourceDomainId}(${loggingData.sourceDomainName}) to domain ${loggingData.destinationDomainId}(${loggingData.destinationDomainName}) - PASSED`
        resolve(result);
        return;
      }
      i++
      if (i > attempts) {
        // transaction should have been bridged already
        print.info('Transaction is taking too much time to bridge!' + JSON.stringify(loggingData))
        result = `resource ${loggingData.resourceId} unable to bridged from domain ${loggingData.sourceDomainId}(${loggingData.sourceDomainName}) to domain ${loggingData.destinationDomainId}(${loggingData.destinationDomainName}) - FAILED \n`
        resolve(result);
        return;
      }
    }
  })
}