import { GluegunToolbox, prompt } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {
  async function getDepositAmount(): Promise<string> {
    const result: { depositAmount: string } = await prompt.ask({
      type: 'input',
      name: 'depositAmount',
      message: "Insert deposit amount",
    })

    toolbox.depositAmount = result.depositAmount
    return result.depositAmount
  }

  async function getGenericHandlerTestingContractAddresses(): Promise<string> {
    const result: { path: string } = await prompt.ask({
      type: 'input',
      name: 'path',
      message: "Insert generic handler testing contract config file path",
    })

    // const executionContractAddress = filesystem.read(
    //   'executionContractAddresses.json',
    //   'json'
    // )  

    toolbox.path = result.path
    return result.path
  }
  toolbox.depositAmount = { getDepositAmount }
  toolbox.path = { getGenericHandlerTestingContractAddresses }
}
