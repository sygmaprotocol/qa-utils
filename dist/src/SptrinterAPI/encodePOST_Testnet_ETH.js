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
require('dotenv').config({ path: 'src/SptrinterAPI/.env' });
const providerURL = process.env.PROVIDER_TST_URL;
const web3js = new web3_1.Web3(providerURL);
const abiPath = "src/ABIS/ERC721Payable.json";
const contractABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const CONTRACT_ADDRESS = '0xAf8De6Aa5004E8e323DCC93C683A55e5eE87b9e9';
const account = "0x9A17FA0A2824EA855EC6aD3eAb3Aa2516EC6626d";
const id = 10037;
const data = "String37";
const contract = new web3js.eth.Contract(contractABI, CONTRACT_ADDRESS);
const callData = contract.methods.mintPayable(account, id, data).encodeABI();
console.log("This is the callData from request " + callData);
function callApi() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = 'https://api.test.sprinter.buildwithsygma.com/solution/call';
        const data = {
            account: account,
            token: "USDC",
            amount: "400",
            destination: 84532,
            destinationContractCall: {
                callData: callData,
                contractAddress: CONTRACT_ADDRESS,
                gasLimit: 301912
            },
            type: "fungible",
            whitelistedSourceChains: [1993]
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
            console.log('Response:', JSON.stringify(jsonResponse, null, 2));
        }
        catch (error) {
            console.error('Error:', error);
        }
    });
}
callApi();
