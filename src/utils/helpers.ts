/* eslint-disable */ 
import { BigNumber, Contract, providers } from "ethers"
import { abi as erc20Abi } from '@openzeppelin/contracts/build/contracts/ERC20.json'
import { print } from "gluegun"

export async function fetchTokenAmount(
  provider: providers.Provider,
  account,
  erc20TokenAddress
): Promise<any> {
  const tokenContract = new Contract(erc20TokenAddress, erc20Abi, provider)

  // Call the 'balanceOf' function to get the balance
  return await tokenContract.balanceOf(account)
}

export type LoggingData = {
  resourceId: string,
  sourceDomainId: number,
  sourceDomainName: string
  destinationDomainId: number
  destinationDomainName: string
}

export const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms))

export const waitUntilBridgedFungibleEvm = async (
  loggingData: LoggingData,
  result: string,
  valueBefore: BigNumber,
  account: string,
  erc20Address: string,
  destinationProvider: providers.Provider,
  intervalDuration: number = 120000,
  attempts: number = 5
): Promise<string> => {
  return new Promise(async (resolve, reject) => {

    let i = 0
    let contractValueAfter: BigNumber
    for (; ;) {
      await sleep(intervalDuration)
      contractValueAfter = await fetchTokenAmount(
        destinationProvider,
        account,
        erc20Address
      )

      if (!contractValueAfter.eq(valueBefore)) {
        console.log('Transaction successfully bridged.', JSON.stringify(loggingData))
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