/* eslint-disable */ 
import { GluegunToolbox } from 'gluegun'
import * as dotenv from 'dotenv'

dotenv.config();

module.exports = (toolbox: GluegunToolbox) => {
  async function getDepositAmount(): Promise<string> {
    let amount: string = ''
    if (process.env.TRANSFER_AMOUNT_EVM !== '0') {
      amount = process.env.TRANSFER_AMOUNT_EVM || ''
    } else {
      amount = process.env.TRANSFER_AMOUNT_SUBSTRATE || ''
    }
    const result: { depositAmount: string } =  {depositAmount: amount}

    toolbox.depositAmount = result.depositAmount
    console.log(`Deposit amount used is ${result.depositAmount}`)
    return result.depositAmount
  }

  async function getGenericHandlerTestingContractAddresses(): Promise<string> {
    const result: { path: string } = {path: process.env.LOCAL_GENERIC_HANDLER_PATH || ""}
    toolbox.path = result.path
    return result.path
  }
  toolbox.depositAmount = { getDepositAmount }
  toolbox.path = { getGenericHandlerTestingContractAddresses }
}
