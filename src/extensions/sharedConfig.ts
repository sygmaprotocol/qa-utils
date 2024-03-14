/* eslint-disable */ 
import { GluegunToolbox, http } from 'gluegun'
import {
  ConfigUrl,
  RawConfig,
} from '@buildwithsygma/sygma-sdk-core'

module.exports = (toolbox: GluegunToolbox) => {
  async function fetchSharedConfig(): Promise<RawConfig> {
    let result: string = '';
    if (typeof toolbox.parameters.options.env !== 'string') {
      result = 'TESTNET'
    } else { result = toolbox.parameters.options.env.toUpperCase().trim()}
    // if domains are configured in local sharedConfig.json file, use local sharedConfig data
      toolbox.env = result
      const api = http.create({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        baseURL: ConfigUrl[result],
      })
      ConfigUrl[result]
      /**
       * This is an empty string because we don't have a unique base url
       * across all environments. To avoid excess logic
       * the whole shared config url is passed as base url.
       */
      const { ok, data } = await api.get('')
      if (!ok) {
        throw new Error('Failed to fetch shared config.')
      }
      console.log(`Evirnonment config was set to ${result}`)
      return data as RawConfig
  }
  toolbox.sharedConfig = { fetchSharedConfig }
}
