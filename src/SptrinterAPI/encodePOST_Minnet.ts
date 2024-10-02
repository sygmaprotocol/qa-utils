import { Web3 } from 'web3';
const fs = require('fs')
require('dotenv').config({ path: 'src/SptrinterAPI/.env' });


const providerURL = process.env.PROVIDER_URL;
const web3js = new Web3(providerURL);

const abiPath = "src/ABIS/ERC721Payable.json"; 
const contractABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const CONTRACT_ADDRESS = '0x1307Bd6EA044bede2f48Acc400CC856a63281722';
const account = "0x9A17FA0A2824EA855EC6aD3eAb3Aa2516EC6626d";
const id = 1031;
const data = "String31";

const contract = new web3js.eth.Contract(contractABI, CONTRACT_ADDRESS)
const callData = contract.methods.mintPayable(account, id, data).encodeABI();

console.log("This is the callData from request " +callData);

async function callApi() {
    const url = 'https://api.sprinter.buildwithsygma.com/solution/call';
    const data = {
        account: account,
        token: "eth",
        amount: "10000000000000",
        destination: 42161,
        destinationContractCall: {
            callData: callData,
            contractAddress: CONTRACT_ADDRESS,
            gasLimit: 450000
        },
        type: "fungible",
        whitelistedSourceChains: [10]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonResponse = await response.json();

        console.log('Response:', JSON.stringify(jsonResponse, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

callApi();