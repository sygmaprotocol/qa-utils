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
const fs = require('fs');
const fetch = require('node-fetch');
require('dotenv').config({ path: 'src/SptrinterAPI/.env' });
const account = "0x9A17FA0A2824EA855EC6aD3eAb3Aa2516EC6626d";
function callApi() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = 'https://api.test.sprinter.buildwithsygma.com/solutions/aggregation';
        const data = {
            account: account,
            token: "USDC",
            amount: "5000000",
            destination: 1993,
            threshold: 1,
            type: "fungible",
            whitelistedSourceChains: [11155111]
        };
        try {
            const response = yield fetch(url, {
                method: 'GET',
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
