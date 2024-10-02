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
const abiPath = "src/ABIS/nativeAdapter.json";
const contractABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const hexValue = "0x3c06d28e20000";
const valueInWei = ethers_1.ethers.BigNumber.from(hexValue);
function sendSignedTransactionWithRawData() {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
        const wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const contractAddress = '0x4CF326d3817558038D1DEF9e76b727202c3E8492'; // Replace with the contract address
        const value = valueInWei;
        const rawData = '0x73c45c98000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000005400000000000000000000000000000000000000000000000000000000004c4b4000000000000000000000000000000000000000000000000000000000000000149a17fa0a2824ea855ec6ad3eab3aa2516ec6626d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000023078000000000000000000000000000000000000000000000000000000000000';
        const gasPrice = yield provider.getGasPrice();
        const gasLimit = 300000;
        const nonce = yield provider.getTransactionCount(wallet.address);
        const tx = {
            to: contractAddress,
            value: value,
            data: rawData,
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
