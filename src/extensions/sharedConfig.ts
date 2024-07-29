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
      result = 'testnet'
    } else { result = toolbox.parameters.options.env.trim()}
    console.log("sharedConfig result", result)
      toolbox.env = result.toUpperCase()
      const api = http.create({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        baseURL: ConfigUrl[result.toUpperCase()],
      })
      ConfigUrl[await result.toUpperCase()]
      /**
       * This is an empty string because we don't have a unique base url
       * across all environments. To avoid excess logic
       * the whole shared config url is passed as base url.
       */
      const { ok, data } = await api.get('')
      if (!ok) {
        throw new Error('Failed to fetch shared config.')
      }
      console.log(`Evirnonment config was set to ${result.toUpperCase()}`)
      return data as RawConfig
  }
  toolbox.sharedConfig = { fetchSharedConfig }
}
