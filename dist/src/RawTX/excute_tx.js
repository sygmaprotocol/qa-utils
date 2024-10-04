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
const hexValue = "0x71afd498d0000";
const valueInWei = ethers_1.ethers.BigNumber.from(hexValue);
function sendSignedTransactionWithRawData() {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
        const wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const contractAddress = '0x6b3BB80A93087CF0eABb72c6a1654C979586E15B'; // Replace with the contract address
        const value = valueInWei;
        const chainID = 84532;
        const rawData = '0xa24b407c000000000000000000000000000000000000000000000000000000000000000f0000000000000000000000009a17fa0a2824ea855ec6ad3eab3aa2516ec6626d';
        const gasPrice = yield provider.getGasPrice();
        const newGasPrice = gasPrice.mul(15).div(10);
        const gasLimit = 500000;
        const nonce = yield provider.getTransactionCount(wallet.address);
        const tx = {
            to: contractAddress,
            value: value,
            data: rawData,
            gasPrice: newGasPrice,
            gasLimit: ethers_1.ethers.utils.hexlify(gasLimit),
            nonce: nonce,
            chainId: chainID
        };
        const signedTx = yield wallet.signTransaction(tx);
        const txResponse = yield provider.sendTransaction(signedTx);
        console.log(`Transaction sent: ${txResponse.hash}`);
        const receipt = yield txResponse.wait();
        console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    });
}
sendSignedTransactionWithRawData().catch((error) => {
    console.error('Error sending transaction:', error);
});
