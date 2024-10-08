import { defineConfig } from "cypress";
import fs from 'fs';
import path from 'path';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      
      on('task', {
        readAbiFile(abiPath: string) {
          const fullPath = path.resolve(abiPath); 
          const abi = fs.readFileSync(fullPath, 'utf8');  
          return JSON.parse(abi);  
        },
      });
      return config;
    },
  },
});