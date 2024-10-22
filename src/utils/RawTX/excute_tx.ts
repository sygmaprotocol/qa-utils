import { ethers }  from 'ethers';
const fs = require("fs");
require('dotenv').config({ path: 'src/utils/RawTX/.env' });

const abiPath = "src/ABIS/nativeAdapter.json"; 
const contractABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const hexValue = "0x3c06d28e20000";
const valueInWei = ethers.BigNumber.from(hexValue);


  async function sendSignedTransactionWithRawData() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

  const contractAddress = '0x4CF326d3817558038D1DEF9e76b727202c3E8492';  // Replace with the contract address
  const value = valueInWei;  
  const chainID = 11155111;

  
  const rawData = '0x73c45c98000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000005400000000000000000000000000000000000000000000000000000000001e84800000000000000000000000000000000000000000000000000000000000000014f956271abfe93c60daebfbf4392d263a217c42d100000000000000000000000000000000000000000000000000000000000000000000000000000000000000023078000000000000000000000000000000000000000000000000000000000000';

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