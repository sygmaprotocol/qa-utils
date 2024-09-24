"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const fs = require("fs");
require('dotenv').config({ path: 'src/AbiTX/.env' });
function sendTransactionToContract(input) {
    return __awaiter(this, void 0, void 0, function* () {
        // Initialize provider and wallet
        const provider = new ethers_1.ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
        const wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, provider);
        // Specify the contract address and ABI
        const contractAddress = '0x21eAB033C7D2DF6A67AeF6C5Bda9A7F151eB9f52'; // Replace with target contract address
        const abiPath = 'src/ABIS/yaho.json'; // Path to your contract's ABI JSON file
        const contractABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        // Create a contract instance
        const contract = new ethers_1.ethers.Contract(contractAddress, contractABI, wallet);
        // Specify the contract function and its parameters
        const functionName = 'dispatchMessage'; // Replace with the function name you want to call
        const functionParams = [
            /* Add the function's parameters here */
            '10200',
            '1',
            '0x9A17FA0A2824EA855EC6aD3eAb3Aa2516EC6626d',
            `0x048656c6c6f20776f726c64${input}`,
            ['0x0000000000000000000000000000000000000000'],
            ['0x731e64a076027b4024ce5a4F68bA9FF0093D3c86']
        ];
        // Estimate gas limit
        const gasLimit = (yield contract.estimateGas[functionName](...functionParams)).add(ethers_1.BigNumber.from(50000));
        const gasPrice = (yield provider.getGasPrice()).mul(ethers_1.BigNumber.from(13)).div(ethers_1.BigNumber.from(10));
        //SpectreProxy -> https://gnosis-chiado.blockscout.com/address/0x50a22ac157C7bA4A82b025403925144124cC609e
        //SpectreAdapter -> https://gnosis-chiado.blockscout.com/address/0x731e64a076027b4024ce5a4F68bA9FF0093D3c86
        // Send the transaction to the contract
        const tx = yield contract[functionName](...functionParams, {
            gasLimit: gasLimit, // Optional, adjust based on function complexity
            gasPrice: gasPrice // Fetch current gas price
        });
        console.log(`Transaction sent: ${tx.hash}`);
        // Wait for the transaction to be mined
        const receipt = yield tx.wait();
        console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    });
}
// sendTransactionToContract(1).catch((error) => {
//     console.error('Error sending transaction:', error);
// });
(() => __awaiter(void 0, void 0, void 0, function* () {
    for (let i = 1; i < 9; i++) {
        console.log("Ittreation", i);
        yield sendTransactionToContract(1).catch((error) => {
            console.error('Error sending transaction:', error);
        });
        console.log("wait 2s...");
        yield new Promise(resolve => setTimeout(() => resolve("ok"), 120000));
    }
}))();
