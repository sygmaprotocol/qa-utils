import { ethers }  from 'ethers';
const fs = require("fs");
require('dotenv').config({ path: 'src/RawTX/.env' });

const abiPath = "src/ABIS/nativeAdapter.json"; 
const contractABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const hexValue = "0x71afd498d0000";
const valueInWei = ethers.BigNumber.from(hexValue);


  async function sendSignedTransactionWithRawData() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

  const contractAddress = '0x6b3BB80A93087CF0eABb72c6a1654C979586E15B';  // Replace with the contract address
  const value = valueInWei;  
  const chainID = 84532;

  
  const rawData = '0xa24b407c000000000000000000000000000000000000000000000000000000000000000f0000000000000000000000009a17fa0a2824ea855ec6ad3eab3aa2516ec6626d';

  const gasPrice = await provider.getGasPrice();
  const newGasPrice = gasPrice.mul(15).div(10);
  const gasLimit = 500000;  
  const nonce = await provider.getTransactionCount(wallet.address);

  const tx = {
      to: contractAddress,
      value: value,  
      data: rawData,    
      gasPrice: newGasPrice,
      gasLimit: ethers.utils.hexlify(gasLimit),
      nonce: nonce,
      chainId: chainID
  };

  const signedTx = await wallet.signTransaction(tx);

  const txResponse = await provider.sendTransaction(signedTx);
  console.log(`Transaction sent: ${txResponse.hash}`);

  const receipt = await txResponse.wait();
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
}

sendSignedTransactionWithRawData().catch((error) => {
  console.error('Error sending transaction:', error);
});