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
require('dotenv').config({ path: 'src/RawTX/.env' });
const abiPath = "src/ABIS/nativeAdapter.json"; // Path to your ABI JSON file
const contractABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const hexValue = "0x92f34455bc0";
const valueInWei = ethers_1.ethers.BigNumber.from(hexValue);
function sendSignedTransactionWithRawData() {
    return __awaiter(this, void 0, void 0, function* () {
        // Initialize provider and wallet
        const provider = new ethers_1.ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
        const wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, provider);
        // Specify the contract address, value, and your raw transaction data
        const contractAddress = '0xc8d25C177c126326c5FD7a50A60ED98098399179'; // Replace with the contract address
        const value = valueInWei; // Specify the value to send (0.01 ETH in this example)
        // Raw transaction data (your input data)
        const rawData = '0xc03bb9080000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000124f8000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000002401e44f2389e0bc34c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000009a17fa0a2824ea855ec6ad3eab3aa2516ec6626d00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000009184e72a0000000000000000000000000001307bd6ea044bede2f48acc400cc856a6328172200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000a4586f2a220000000000000000000000009a17fa0a2824ea855ec6ad3eab3aa2516ec6626d00000000000000000000000000000000000000000000000000000000000003f800000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000008537472696e67313600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
        // Get the current gas price and nonce
        const gasPrice = yield provider.getGasPrice();
        const gasLimit = 300000; // Estimate an appropriate gas limit
        const nonce = yield provider.getTransactionCount(wallet.address);
        // Create a raw transaction object
        const tx = {
            to: contractAddress,
            value: value, // Value to transfer (in this case 0.01 ETH)
            data: rawData, // Your raw transaction data
            gasPrice: gasPrice,
            gasLimit: ethers_1.ethers.utils.hexlify(gasLimit),
            nonce: nonce
        };
        // Sign the transaction with your wallet
        const signedTx = yield wallet.signTransaction(tx);
        // Send the signed transaction
        const txResponse = yield provider.sendTransaction(signedTx);
        console.log(`Transaction sent: ${txResponse.hash}`);
        // Wait for the transaction to be confirmed
        const receipt = yield txResponse.wait();
        console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    });
}
sendSignedTransactionWithRawData().catch((error) => {
    console.error('Error sending transaction:', error);
});
