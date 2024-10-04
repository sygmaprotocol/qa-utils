"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("cypress-plugin-api");
/// <reference types="cypress" />
const params = {
    your_wallet: '0x9A17FA0A2824EA855EC6aD3eAb3Aa2516EC6626d',
    test_wallet_assertions: '0xB99437c5B65e7B65429b368b7cF6A4cFF482C147',
    token: "usdc",
    sepolia_chainID: 11155111,
    base_chainID: 84532,
    b3_chainID: 1993,
    amount_usdc_sepolia: 21987267, // used in assertion 
    amount_usdc_base: 3878710, // used in assertion
    amount_usdc_b3: 5782100, // used in assertion
    amount_eth_sepolia: 231551213100000000, // used in assertion 
    amount_eth_base: 149827210000000000, // used in assertion
    amount_eth_b3: 12341200000000000, // used in assertion
    threshold: 1, //define them to pass
};
describe('Sprinter API Testing on Testnet for all GET calls', () => {
    const baseUrl = 'https://api.test.sprinter.buildwithsygma.com';
    it('GET request /health', () => {
        const apiUrl = `${baseUrl}/health`;
        cy.api({
            method: 'GET',
            url: apiUrl,
        }).then((response) => {
            cy.log(JSON.stringify(response.body));
            cy.log('Response Status:', response.status.toString());
            cy.log('Response Headers:', JSON.stringify(response.headers));
            const responseBody = JSON.stringify(response.body, null, 2);
            const truncatedBody = responseBody.length > 1000 ? responseBody.substring(0, 1000) + '...' : responseBody;
            cy.log('Response Body:', truncatedBody);
            console.log('Full Response Body:', response.body);
            // Assertions
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('status').and.equal('ok');
        });
    });
    it('GET request /networks', () => {
        const apiUrl = `${baseUrl}/networks`;
        cy.api({
            method: 'GET',
            url: apiUrl,
        }).then((response) => {
            var _a, _b, _c;
            cy.log(JSON.stringify(response.body));
            cy.log('Response Status:', response.status.toString());
            cy.log('Response Headers:', JSON.stringify(response.headers));
            const responseBody = JSON.stringify(response.body, null, 2);
            const truncatedBody = responseBody.length > 1000 ? responseBody.substring(0, 1000) + '...' : responseBody;
            cy.log('Response Body:', truncatedBody);
            console.log('Full Response Body:', response.body);
            // Assertions
            expect(response.status).to.eq(200);
            const network_sep = (_a = response.body.data.find((item) => item.chainID === params.sepolia_chainID)) === null || _a === void 0 ? void 0 : _a.name;
            const network_base = (_b = response.body.data.find((item) => item.chainID === params.base_chainID)) === null || _b === void 0 ? void 0 : _b.name;
            const network_b3 = (_c = response.body.data.find((item) => item.chainID === params.b3_chainID)) === null || _c === void 0 ? void 0 : _c.name;
            expect(network_b3).to.be.equal(`B3Sepolia`);
            expect(network_sep).to.be.equal(`Sepolia`);
            expect(network_base).to.be.equal(`BaseSepolia`);
        });
    });
    it('GET request assets/fungible', () => {
        const apiUrl = `${baseUrl}/assets/fungible`;
        cy.api({
            method: 'GET',
            url: apiUrl,
        }).then((response) => {
            var _a, _b, _c;
            cy.log(JSON.stringify(response.body));
            cy.log('Response Status:', response.status.toString());
            cy.log('Response Headers:', JSON.stringify(response.headers));
            const responseBody = JSON.stringify(response.body, null, 2);
            const truncatedBody = responseBody.length > 1000 ? responseBody.substring(0, 1000) + '...' : responseBody;
            cy.log('Response Body:', truncatedBody);
            console.log('Full Response Body:', response.body);
            // Assertions
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('data');
            const name_USDC = response.body.data[0].name;
            const name_WETH = response.body.data[1].name;
            expect(name_USDC).to.exist.and.be.equal('USDC');
            expect(name_WETH).to.exist.and.be.equal('Wrapped ETH');
            const address_usdc_sep = (_a = response.body.data.find((item) => item.name === name_USDC)) === null || _a === void 0 ? void 0 : _a.addresses[params.sepolia_chainID];
            const address_usdc_base = (_b = response.body.data.find((item) => item.name === name_USDC)) === null || _b === void 0 ? void 0 : _b.addresses[params.base_chainID];
            const address_usdc_b3 = (_c = response.body.data.find((item) => item.name === name_USDC)) === null || _c === void 0 ? void 0 : _c.addresses[params.b3_chainID];
            expect(address_usdc_sep).to.exist.and.be.equal('0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238');
            expect(address_usdc_base).to.exist.and.be.equal('0x036CbD53842c5426634e7929541eC2318f3dCF7e');
            expect(address_usdc_b3).to.exist.and.be.equal('0xE61e5ed4c4f198c5384Ef57E69aAD1eF0c911004');
        });
    });
    it('GET request /accounts/{account}/assets/native', () => {
        const apiUrl = `${baseUrl}/accounts/${params.test_wallet_assertions}/assets/native`;
        cy.api({
            method: 'GET',
            url: apiUrl,
        }).then((response) => {
            var _a, _b, _c;
            cy.log(JSON.stringify(response.body));
            cy.log('Response Status:', response.status.toString());
            cy.log('Response Headers:', JSON.stringify(response.headers));
            const responseBody = JSON.stringify(response.body, null, 2);
            const truncatedBody = responseBody.length > 1000 ? responseBody.substring(0, 1000) + '...' : responseBody;
            cy.log('Response Body:', truncatedBody);
            console.log('Full Response Body:', response.body);
            // Assertions
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('data');
            const chainId = response.body.data[0].chainId;
            const balanceB3 = Number((_a = response.body.data.find((item) => item.chainId === params.b3_chainID)) === null || _a === void 0 ? void 0 : _a.balance);
            const balanceSep = Number((_b = response.body.data.find((item) => item.chainId === params.sepolia_chainID)) === null || _b === void 0 ? void 0 : _b.balance);
            const balanceBase = Number((_c = response.body.data.find((item) => item.chainId === params.base_chainID)) === null || _c === void 0 ? void 0 : _c.balance);
            expect(balanceB3).to.be.equal(params.amount_eth_b3);
            expect(balanceSep).to.be.equal(params.amount_eth_sepolia);
            expect(balanceBase).to.be.equal(params.amount_eth_base);
        });
    });
    it('GET request assets/fungible/{token} = USDC', () => {
        const apiUrl = `${baseUrl}/assets/fungible/usdc`;
        cy.api({
            method: 'GET',
            url: apiUrl,
        }).then((response) => {
            cy.log(JSON.stringify(response.body));
            cy.log('Response Status:', response.status.toString());
            cy.log('Response Headers:', JSON.stringify(response.headers));
            const responseBody = JSON.stringify(response.body, null, 2);
            const truncatedBody = responseBody.length > 1000 ? responseBody.substring(0, 1000) + '...' : responseBody;
            cy.log('Response Body:', truncatedBody);
            console.log('Full Response Body:', response.body);
            // Assertions
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('addresses');
            console.log("This is address for sep", response.body.addresses);
            const address_usdc_sep = response.body.addresses[params.sepolia_chainID];
            const address_usdc_base = response.body.addresses[params.base_chainID];
            const address_usdc_b3 = response.body.addresses[params.b3_chainID];
            // const address_usdc_base = response.body.data.find(
            //   (item: { name: string }) => item.name === name_USDC
            // )?.addresses[params.destination_base];
            // const address_usdc_b3 = response.body.data.find(
            //   (item: { name: string }) => item.name === name_USDC
            // )?.addresses[params.destination_b3];
            expect(address_usdc_sep).to.be.equal('0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238');
            expect(address_usdc_base).to.be.equal('0x036CbD53842c5426634e7929541eC2318f3dCF7e');
            expect(address_usdc_b3).to.be.equal('0xE61e5ed4c4f198c5384Ef57E69aAD1eF0c911004');
        });
    });
    it.skip('GET request assets/fungible/{token} = WETH', () => {
        const apiUrl = `${baseUrl}/assets/fungible/usdc`;
        cy.api({
            method: 'GET',
            url: apiUrl,
        }).then((response) => {
            cy.log(JSON.stringify(response.body));
            cy.log('Response Status:', response.status.toString());
            cy.log('Response Headers:', JSON.stringify(response.headers));
            const responseBody = JSON.stringify(response.body, null, 2);
            const truncatedBody = responseBody.length > 1000 ? responseBody.substring(0, 1000) + '...' : responseBody;
            cy.log('Response Body:', truncatedBody);
            console.log('Full Response Body:', response.body);
            // Assertions
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('addresses');
            console.log("This is address for sep", response.body.addresses);
            const address_weth_sep = response.body.addresses[params.sepolia_chainID];
            const address_weth_base = response.body.addresses[params.base_chainID];
            const address_weth_b3 = response.body.addresses[params.b3_chainID];
            // const address_usdc_base = response.body.data.find(
            //   (item: { name: string }) => item.name === name_USDC
            // )?.addresses[params.destination_base];
            // const address_usdc_b3 = response.body.data.find(
            //   (item: { name: string }) => item.name === name_USDC
            // )?.addresses[params.destination_b3];
            expect(address_weth_sep).to.be.equal('0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9');
            expect(address_weth_base).to.be.equal('0x4200000000000000000000000000000000000006');
            expect(address_weth_b3).to.be.equal('0x3538f4C55893eDca690D1e4Cf9Fb61FB70cd0DD8');
        });
    });
    it('GET request /accounts/{account}/assets/fungible/{token}', () => {
        const apiUrl = `${baseUrl}/accounts/${params.test_wallet_assertions}/assets/fungible/${params.token}`;
        cy.api({
            method: 'GET',
            url: apiUrl,
        }).then((response) => {
            var _a, _b, _c;
            cy.log(JSON.stringify(response.body));
            cy.log('Response Status:', response.status.toString());
            cy.log('Response Headers:', JSON.stringify(response.headers));
            const responseBody = JSON.stringify(response.body, null, 2);
            const truncatedBody = responseBody.length > 1000 ? responseBody.substring(0, 1000) + '...' : responseBody;
            cy.log('Response Body:', truncatedBody);
            console.log('Full Response Body:', response.body);
            // Assertions
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('data');
            const chainId = response.body.data[0].chainId;
            expect(chainId).to.exist;
            const balanceB3 = Number((_a = response.body.data.find((item) => item.chainId === params.b3_chainID)) === null || _a === void 0 ? void 0 : _a.balance);
            const balanceSep = Number((_b = response.body.data.find((item) => item.chainId === params.sepolia_chainID)) === null || _b === void 0 ? void 0 : _b.balance);
            const balanceBase = Number((_c = response.body.data.find((item) => item.chainId === params.base_chainID)) === null || _c === void 0 ? void 0 : _c.balance);
            expect(balanceB3).to.be.equal(params.amount_usdc_b3);
            expect(balanceSep).to.be.equal(params.amount_usdc_sepolia);
            expect(balanceBase).to.be.equal(params.amount_usdc_base);
        });
    });
    it.skip('GET request /networks/{chainID}/assets/fungible - Sepolia', () => {
        const apiUrl = `${baseUrl}/networks/${params.sepolia_chainID}/assets/fungible`;
        cy.api({
            method: 'GET',
            url: apiUrl,
        }).then((response) => {
            var _a, _b, _c;
            cy.log(JSON.stringify(response.body));
            cy.log('Response Status:', response.status.toString());
            cy.log('Response Headers:', JSON.stringify(response.headers));
            const responseBody = JSON.stringify(response.body, null, 2);
            const truncatedBody = responseBody.length > 1000 ? responseBody.substring(0, 1000) + '...' : responseBody;
            cy.log('Response Body:', truncatedBody);
            console.log('Full Response Body:', response.body);
            // Assertions
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('data');
            const name_USDC = response.body.data[0].name;
            const name_WETH = response.body.data[1].name;
            expect(name_USDC).to.exist.and.be.equal('USDC');
            expect(name_WETH).to.exist.and.be.equal('Wrapped ETH');
            const address_usdc_sep = (_a = response.body.data.find((item) => item.name === name_USDC)) === null || _a === void 0 ? void 0 : _a.addresses[params.sepolia_chainID];
            const address_usdc_base = (_b = response.body.data.find((item) => item.name === name_USDC)) === null || _b === void 0 ? void 0 : _b.addresses[params.base_chainID];
            const address_usdc_b3 = (_c = response.body.data.find((item) => item.name === name_USDC)) === null || _c === void 0 ? void 0 : _c.addresses[params.b3_chainID];
            expect(address_usdc_sep).to.exist.and.be.equal('0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238');
            expect(address_usdc_base).to.exist.and.be.equal('0x036CbD53842c5426634e7929541eC2318f3dCF7e');
            expect(address_usdc_b3).to.exist.and.be.equal('0xE61e5ed4c4f198c5384Ef57E69aAD1eF0c911004');
        });
    });
    it('GET request /solutions/aggregation - Sepolia to Base with USDC', () => {
        const queryParams = new URLSearchParams({
            account: `${params.your_wallet}`,
            destination: `${params.base_chainID}`,
            token: 'usdc',
            amount: '12000000',
            threshold: `${params.threshold}`,
            whitelistedSourceChains: `${params.sepolia_chainID}`
        }).toString();
        const apiUrl = `${baseUrl}/solutions/aggregation?${queryParams}`;
        cy.api({
            method: 'GET',
            url: apiUrl,
        }).then((response) => {
            cy.log(JSON.stringify(response.body));
            cy.log('Response Status:', response.status.toString());
            cy.log('Response Headers:', JSON.stringify(response.headers));
            const responseBody = JSON.stringify(response.body, null, 2);
            const truncatedBody = responseBody.length > 1000 ? responseBody.substring(0, 1000) + '...' : responseBody;
            cy.log('Response Body:', truncatedBody);
            console.log('Full Response Body:', response.body);
            // Assertions
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('data');
            expect(response.body.data[0]).to.have.property('sourceChain').equal(params.sepolia_chainID);
            expect(response.body.data[0]).to.have.property('destinationChain').equal(params.base_chainID);
            expect(response.body.data[0].tool['name']).equal(`Sygma-Testnet`);
            expect(response.body.data[0].fee['amount']).equal(`1056000000000000`);
            expect(response.body.data[0]).to.have.property('transaction');
            expect(response.body.data[0].transaction['to']).equal(`0x4CF326d3817558038D1DEF9e76b727202c3E8492`);
            expect(response.body.data[0].transaction['value']).equal(`0x3c06d28e20000`);
            expect(response.body.data[0].transaction['chainId']).equal(params.sepolia_chainID);
            expect(response.body.data[0]).to.have.property('approvals');
            expect(response.body.data[0].approvals[0]['data']).length.above(10);
            expect(response.body.data[0].approvals[0]['to']).equal(`0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`);
            expect(response.body.data[0].approvals[0]['from']).equal(`${params.your_wallet}`);
            expect(response.body.data[0].approvals[0]['value']).equal(`0x0`);
            expect(response.body.data[0].approvals[0]['chainId']).equal(params.sepolia_chainID);
        });
    });
    it('GET request /solutions/aggregation - Base to B3 with ETH', () => {
        const queryParams = new URLSearchParams({
            account: `${params.your_wallet}`,
            destination: `${params.b3_chainID}`,
            token: 'eth',
            amount: '1000000000000000',
            threshold: `${params.threshold}`,
            whitelistedSourceChains: `${params.base_chainID}`
        }).toString();
        const apiUrl = `${baseUrl}/solutions/aggregation?${queryParams}`;
        cy.api({
            method: 'GET',
            url: apiUrl,
        }).then((response) => {
            cy.log(JSON.stringify(response.body));
            cy.log('Response Status:', response.status.toString());
            cy.log('Response Headers:', JSON.stringify(response.headers));
            const responseBody = JSON.stringify(response.body, null, 2);
            const truncatedBody = responseBody.length > 1000 ? responseBody.substring(0, 1000) + '...' : responseBody;
            cy.log('Response Body:', truncatedBody);
            console.log('Full Response Body:', response.body);
            // Assertions
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('data');
            expect(response.body.data[0]).to.have.property('sourceChain').equal(params.base_chainID);
            expect(response.body.data[0]).to.have.property('destinationChain').equal(params.b3_chainID);
            expect(response.body.data[0].tool['name']).equal(`Sygma-Testnet`);
            expect(response.body.data[0].fee['amount']).equal(`1000000000000000`);
            expect(response.body.data[0]).to.have.property('transaction');
            expect(response.body.data[0].transaction['to']).equal(`0x6b3BB80A93087CF0eABb72c6a1654C979586E15B`);
            expect(response.body.data[0].transaction['value']).equal(`0x71afd498d0000`);
            expect(response.body.data[0].transaction['chainId']).equal(params.base_chainID);
            expect(response.body.data[0]).to.have.property('approvals');
            expect(response.body.data[0].approvals).is.null;
        });
    });
});
