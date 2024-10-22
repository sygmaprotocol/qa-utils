const { ethers } = require("ethers");

async function speedUpTransaction(transactionHash: string) {
    // Connect to Ethereum provider
    const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
    
    // Create a wallet instance
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Fetch the original transaction details
    const originalTx = await provider.getTransaction(transactionHash);

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
        const txResponse = await wallet.sendTransaction(tx);
        console.log(`New transaction sent to speed up: ${txResponse.hash}`);

        // Optionally wait for the transaction to be confirmed
        await txResponse.wait();
        console.log(`New transaction confirmed in block: ${txResponse.blockNumber}`);
    } catch (error) {
        console.error("Error sending new transaction:", error);
    }
}

// Replace with your transaction hash
const transactionHash = "0xYourTransactionHashHere";
speedUpTransaction(transactionHash).catch(console.error);
