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
const web3_1 = require("web3");
const fs = require('fs');
const fetch = require('node-fetch');
require('dotenv').config({ path: 'src/SptrinterAPI/.env' });
// Initialize web3 with the provider URL
const providerURL = process.env.PROVIDER_URL;
const web3js = new web3_1.Web3(providerURL);
const abiPath = "src/ABIS/ERC721Payable.json"; // Path to your ABI JSON file
const contractABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const CONTRACT_ADDRESS = '0x1307Bd6EA044bede2f48Acc400CC856a63281722';
const account = "0x9A17FA0A2824EA855EC6aD3eAb3Aa2516EC6626d";
const id = 1016;
const data = "String16";
const contract = new web3js.eth.Contract(contractABI, CONTRACT_ADDRESS);
const callData = contract.methods.mintPayable(account, id, data).encodeABI();
console.log("This is the callData from request " + callData);
function callApi() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = 'https://api.sprinter.buildwithsygma.com/solution/call';
        const data = {
            account: account,
            token: "eth",
            amount: "10000000000000",
            destination: 8333,
            destinationContractCall: {
                callData: callData,
                contractAddress: CONTRACT_ADDRESS,
                gasLimit: 75000
            },
            type: "fungible",
            whitelistedSourceChains: [8453]
        };
        try {
            const response = yield fetch(url, {
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
            const jsonResponse = yield response.json();
            // Use JSON.stringify to print full object in a readable format
            console.log('Response:', JSON.stringify(jsonResponse, null, 2));
        }
        catch (error) {
            console.error('Error:', error);
        }
    });
}
callApi();
