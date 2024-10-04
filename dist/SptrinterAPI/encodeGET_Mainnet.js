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
var Get_Mainnet;
(function (Get_Mainnet) {
    const account = "0x9A17FA0A2824EA855EC6aD3eAb3Aa2516EC6626d";
    function callApi() {
        return __awaiter(this, void 0, void 0, function* () {
            const baseUrl = 'https://api.sprinter.buildwithsygma.com/solutions/aggregation';
            const params = new URLSearchParams({
                account: account,
                token: "ETH",
                amount: "10000000000000",
                destination: String(8333), // Convert number to string
                threshold: String(1), // Convert number to string
                type: "fungible",
                whitelistedSourceChains: [1].join(',') // Convert array to string
            });
            const url = `${baseUrl}?${params.toString()}`;
            try {
                const response = yield fetch(url, {
                    method: 'GET',
                    headers: {
                        'accept': 'application/json'
                    }
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
    Get_Mainnet.callApi = callApi;
})(Get_Mainnet || (Get_Mainnet = {}));
Get_Mainnet.callApi();
