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
const { ethers } = require("ethers");
function speedUpTransaction(transactionHash) {
    return __awaiter(this, void 0, void 0, function* () {
        // Connect to Ethereum provider
        const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
        // Create a wallet instance
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        // Fetch the original transaction details
        const originalTx = yield provider.getTransaction(transactionHash);
        if (!originalTx) {
            console.error("Transaction not found");
            return;
        }
        // Prepare the new transaction with a higher gas price
        const newGasPrice = originalTx.gasPrice.mul(2); // Example: double the gas price
        const tx = {
            nonce: originalTx.nonce, // Use the same nonce as the original transaction
            to: originalTx.to,
            value: originalTx.value, // Keep the same value
            data: originalTx.data, // Keep the same data
            gasLimit: originalTx.gasLimit, // Keep the same gas limit
            gasPrice: newGasPrice, // Set the new higher gas price
        };
        try {
            // Send the new transaction
            const txResponse = yield wallet.sendTransaction(tx);
            console.log(`New transaction sent to speed up: ${txResponse.hash}`);
            // Optionally wait for the transaction to be confirmed
            yield txResponse.wait();
            console.log(`New transaction confirmed in block: ${txResponse.blockNumber}`);
        }
        catch (error) {
            console.error("Error sending new transaction:", error);
        }
    });
}
// Replace with your transaction hash
const transactionHash = "0xYourTransactionHashHere";
speedUpTransaction(transactionHash).catch(console.error);
