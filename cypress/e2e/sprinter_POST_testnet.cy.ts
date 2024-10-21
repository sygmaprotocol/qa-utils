/// <reference types="cypress" />
import 'cypress-plugin-api';
import { param } from 'cypress/types/jquery';
import { Web3 } from 'web3';
import { AbiItem } from 'web3-utils';  // Import AbiItem from web3-utils

require('dotenv').config({ path: 'src/SptrinterAPI/.env' });

//ERC721 native contrats for test: https://www.notion.so/chainsafe/Native-QA-of-Sprinter-API-9a14395f0ab64910b4f5812f19be43b2#1032103664e8806f8044c0d8df9335fa

const params = {
  your_wallet:'0x9A17FA0A2824EA855EC6aD3eAb3Aa2516EC6626d',
  test_wallet_assertions:'0xB99437c5B65e7B65429b368b7cF6A4cFF482C147',
  test_weth_wallet:'0x8672F5C85066F7C0fc52e88398de052Bb0920927',
  token: "usdc",
  sepolia_chainID : 11155111, 
  contract_Sprinter_sep:"0xf70fb86F700E8Bb7cDf1c20197633518235c3425",
  sep_USDC_contract: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  sep_bridge_contract: "0x4CF326d3817558038D1DEF9e76b727202c3E8492",
  sep_native_contract: "0xb55D0F87eE4a76fAa2f1d01A5abf3f1EB1bbFdd6",
  contract_ERC721_sep: "0x99eb23BEC48bF56C80889cFbcBF2d491F8aC75fe",
  sep_SYGMA_WETH_contract: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
  sep_SPRINTER_WETH_contract: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
  sep_NFT_price_eth: 10000000,
  base_chainID : 84532,
  contract_Sprinter_base: "0x3F9A68fF29B3d86a6928C44dF171A984F6180009",
  base_USDC_contract: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  base_bridge_contract: "0x9D5C332Ebe0DaE36e07a4eD552Ad4d8c5067A61F",
  base_native_contract: "0x6b3BB80A93087CF0eABb72c6a1654C979586E15B",
  contract_ERC721_base: "0xAf8De6Aa5004E8e323DCC93C683A55e5eE87b9e9",
  base_WETH_contract: "0x4200000000000000000000000000000000000006",
  base_NFT_price_eth: 100000000000000,
  b3_chainID : 1993,
  contract_Sprinter_b3: "0x17e4C404aD634E429ebCdF9a10F38A96Ce8eEF27",
  b3_USDC_contract: "0xE61e5ed4c4f198c5384Ef57E69aAD1eF0c911004",
  b3_bridge_contract: "0xFF92C3C393B22F9d26e5732F2601EaC04094880F",
  b3_native_contract: "0x7f1B01c8daFa8B8Ce843A47f85458C0F26B6b47b",
  contract_ERC721_b3: "0xAf8De6Aa5004E8e323DCC93C683A55e5eE87b9e9",
  b3_WETH_contract: "0x3538f4C55893eDca690D1e4Cf9Fb61FB70cd0DD8",
  b3_NFT_price_eth: 100000000000000,
  amount_usdc_sepolia : 21987267, // used in assertion 
  amount_usdc_base : 3878710, // used in assertion
  amount_usdc_b3 : 5782100, // used in assertion
  amount_eth_sepolia : 231551213100000000, // used in assertion 
  amount_eth_base : 149827210000000000, // used in assertion
  amount_eth_b3 : 12341200000000000, // used in assertion
  threshold : 1, //define them to pass
}


describe('Sprinter API Testing on Testnet for all POST calls', () => {
  const baseUrl = 'https://api.test.sprinter.buildwithsygma.com';
  const providerURL = process.env.PROVIDER_TST_URL;
  const web3js = new Web3(providerURL);

  before(() => {
    const name = 'SP_claimName_test01';
    const amountClaimed = `2000000`;
    const account = params.your_wallet;
    const id = 911003;
    const data = `Test_911003`;
    
    cy.task('readAbiFile', 'src/ABIS/sprinterName.json').then((result) => {
      const contractABI_Sprinter = result as AbiItem[];
      const contract = new web3js.eth.Contract(contractABI_Sprinter, `${params.contract_Sprinter_base}`);
      const callData = contract.methods.claimName(name, account, amountClaimed).encodeABI();
      cy.wrap(callData).as('callData_usdc_2000000'); // Store the callData for later use
    }); 

    cy.task('readAbiFile', 'src/ABIS/ERC721Payable.json').then((result) => {
      const contractABI_ERC721 = result as AbiItem[];
      const contract = new web3js.eth.Contract(contractABI_ERC721, `${params.contract_Sprinter_base}`);
      const callData = contract.methods.mintPayable(account , id, data).encodeABI();
      cy.wrap(callData).as('callData_eth_minPayable'); // Store the callData for later use
    });
  
  });

  // solution/call tests

  it('POST solution/call - Valid response with USDC from Sep to Base using Sprinter contract for claimName method for USDC amount transfer == contract call amount', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: "2000000",
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.test_wallet_assertions,
      threshold: `${params.threshold}`,
      token: params.token,
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(200); // Validate status code for created resource
      expect(response.body).to.have.property('data');
      expect(response.body.data[0].sourceChain).equal(params.sepolia_chainID);
      expect(response.body.data[0].destinationChain).equal(params.base_chainID);
      expect(response.body.data[0].amount).equal("2000000");
      expect(response.body.data[0]).to.have.property('transaction');
      expect(response.body.data[0].transaction.to).equal(params.sep_bridge_contract);
      expect(response.body.data[0].transaction.value).not.to.equal("0x0");
      expect(response.body.data[0]).to.have.property('approvals');
      expect(response.body.data[0].approvals[0].to).equal(params.sep_USDC_contract);
      expect(response.body.data[0].approvals[0].value).equal('0x0');
      expect(response.body.data[0].approvals[0].chainId).equal(params.sepolia_chainID);
    });
  });

  it ('POST solution/call - Valid response with USDC from Sep to Base using Sprinter contract for claimName method for USDC amount transfer > contract call amount', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: "4000000",
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.test_wallet_assertions,
      threshold: `${params.threshold}`,
      token: params.token,
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(200); // Validate status code for created resource
      expect(response.body).to.have.property('data');
      expect(response.body.data[0].sourceChain).equal(params.sepolia_chainID);
      expect(response.body.data[0].destinationChain).equal(params.base_chainID);
      expect(response.body.data[0].amount).equal("4000000");
      expect(response.body.data[0]).to.have.property('transaction');
      expect(response.body.data[0].transaction.to).equal(params.sep_bridge_contract);
      expect(response.body.data[0].transaction.value).not.to.equal("0x0");
      expect(response.body.data[0]).to.have.property('approvals');
      expect(response.body.data[0].approvals[0].to).equal(params.sep_USDC_contract);
      expect(response.body.data[0].approvals[0].value).equal('0x0');
      expect(response.body.data[0].approvals[0].chainId).equal(params.sepolia_chainID);
    });
  });

  it('POST solution/call - Valid response with USDC from Sep to Base with missing destinationContractCall param but still recipient set to other address', function () {
    const data = {
      account: params.your_wallet,
      amount: "2000000",
      destination: params.base_chainID,
      recipient: "0xF956271abfe93C60DaEBfbF4392d263a217C42d1",
      threshold: `${params.threshold}`,
      token: params.token,
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(200); // Validate status code for created resource
      expect(response.body).to.have.property('data');
      expect(response.body.data[0].sourceChain).equal(params.sepolia_chainID);
      expect(response.body.data[0].destinationChain).equal(params.base_chainID);
      expect(response.body.data[0].amount).equal("2000000");
      expect(response.body.data[0]).to.have.property('transaction');
      expect(response.body.data[0].transaction.to).equal(params.sep_bridge_contract);
      expect(response.body.data[0].transaction.value).not.to.equal("0x0");
      expect(response.body.data[0]).to.have.property('approvals');
      expect(response.body.data[0].approvals[0].to).equal(params.sep_USDC_contract);
      expect(response.body.data[0].approvals[0].value).equal('0x0');
      expect(response.body.data[0].approvals[0].chainId).equal(params.sepolia_chainID);
    });
  });

  it('POST solution/call - Valid response with USDC from Sep to Base with missing destinationContractCall param and missing recipietn address', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: "2000000",
      destination: params.base_chainID,
      threshold: `${params.threshold}`,
      token: params.token,
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(200); // Validate status code for created resource
      expect(response.body).to.have.property('data');
      expect(response.body.data[0].sourceChain).equal(params.sepolia_chainID);
      expect(response.body.data[0].destinationChain).equal(params.base_chainID);
      expect(response.body.data[0].amount).equal("2000000");
      expect(response.body.data[0]).to.have.property('transaction');
      expect(response.body.data[0].transaction.to).equal(params.sep_bridge_contract);
      expect(response.body.data[0].transaction.value).not.to.equal("0x0");
      expect(response.body.data[0]).to.have.property('approvals');
      expect(response.body.data[0].approvals[0].to).equal(params.sep_USDC_contract);
      expect(response.body.data[0].approvals[0].value).equal('0x0');
      expect(response.body.data[0].approvals[0].chainId).equal(params.sepolia_chainID);
    });
  });

  it('POST solution/call - Valid response with USDC from Sep to Base with missing destinationContractCall param, missing recipietn address and treshold value', function () {
    const data = {
      account: params.your_wallet,
      amount: "2000000",
      destination: params.base_chainID,
      token: params.token,
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(200); // Validate status code for created resource
      expect(response.body).to.have.property('data');
      expect(response.body.data[0].sourceChain).equal(params.sepolia_chainID);
      expect(response.body.data[0].destinationChain).equal(params.base_chainID);
      expect(response.body.data[0].amount).equal("2000000");
      expect(response.body.data[0]).to.have.property('transaction');
      expect(response.body.data[0].transaction.to).equal(params.sep_bridge_contract);
      expect(response.body.data[0].transaction.value).not.to.equal("0x0");
      expect(response.body.data[0]).to.have.property('approvals');
      expect(response.body.data[0].approvals[0].to).equal(params.sep_USDC_contract);
      expect(response.body.data[0].approvals[0].value).equal('0x0');
      expect(response.body.data[0].approvals[0].chainId).equal(params.sepolia_chainID);
    });
  });

  it('POST solution/call - Valid data using USDC from Sep to Base using amount === 0', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: "0",
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.test_wallet_assertions,
      threshold: `${params.threshold}`,
      token: "USDC",
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(200); // Validate status code for created resource
      expect(response.body).to.have.property('data');
      expect(response.body.data[0].sourceChain).equal(params.sepolia_chainID);
      expect(response.body.data[0].destinationChain).equal(params.base_chainID);
      expect(response.body.data[0].amount).equal("0");
      expect(response.body.data[0]).to.have.property('transaction');
      expect(response.body.data[0].transaction.to).equal(params.sep_bridge_contract);
      expect(response.body.data[0].transaction.value).not.to.equal("0x0");
      expect(response.body.data[0]).to.have.property('approvals');
      expect(response.body.data[0].approvals[0].to).equal(params.sep_USDC_contract);
      expect(response.body.data[0].approvals[0].value).equal('0x0');
      expect(response.body.data[0].approvals[0].chainId).equal(params.sepolia_chainID);
    });
  });

  it('Negative POST solution/call - Valid data using USDC from Sep to Base except account being correct', function () {
    const data = {
      account: "0xB99437c5B65e7B65429b368b7cF6A4cFF482C14",
      amount: "2000000",
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.test_wallet_assertions,
      threshold: `${params.threshold}`,
      token: params.token,
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Key: 'request.Account' Error:Field validation for 'Account' failed on the 'eth_address' tag"); 
    });
  });

  it('Negative POST solution/call - Valid data using USDC from Sep to Base except missing the call data', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: "2000000",
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.test_wallet_assertions,
      threshold: `${params.threshold}`,
      token: params.token,
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Key: 'request.DestContractCall.CallData' Error:Field validation for 'CallData' failed on the 'required' tag"); 
    });
  });

  it('Negative POST solution/call - Valid data using USDC from Sep to Base except  wrong token (USDP)', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: "2000000",
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.test_wallet_assertions,
      threshold: `${params.threshold}`,
      token: "USDP",
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Key: 'request.Token' Error:Field validation for 'Token' failed on the 'supported_token' tag"); 
    });
  });

  it('Negative POST solution/call - Valid data using USDC from Sep to Base with transfer amount > balance', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: "22987267",
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.test_wallet_assertions,
      threshold: `${params.threshold}`,
      token: "USDC",
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property('error').equal("No solution found"); 
    });
  });

  it('Negative POST solution/call - Valid data using USDC from Sep to Base except amount set to decimal', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: "0.23",
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.test_wallet_assertions,
      threshold: `${params.threshold}`,
      token: "USDC",
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Failed to convert string into big.int"); 
    });
  });

  it('Negative POST solution/call - Valid data using USDC from Sep to Base with amount set to a string', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: "asda2",
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.test_wallet_assertions,
      threshold: `${params.threshold}`,
      token: "USDC",
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Failed to convert string into big.int"); 
    });
  });

  it('Negative POST solution/call - Valid data using USDC from Sep to Base except  destination but exiting in Sygma Shared Config (338 - Cronos)', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: "2000000",
      destination: 338,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.test_wallet_assertions,
      threshold: `${params.threshold}`,
      token: "USDC",
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Key: 'request.Destination' Error:Field validation for 'Destination' failed on the 'supported_chain' tag"); 
    });
  });

  it('Negative POST solution/call - Valid data using USDC from Sep to Base except source but exiting in Sygma Shared Config (338 - Cronos)', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: "2000000",
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.test_wallet_assertions,
      threshold: `${params.threshold}`,
      token: "USDC",
      type: "fungible",
      whitelistedSourceChains: [
        338
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Key: 'request.WhitelistedSourceChains' Error:Field validation for 'WhitelistedSourceChains' failed on the 'supported_chains' tag"); 
    });
  });

  it('Negative POST solution/call - Valid data using USDC from Sep to Base except that the destination contract address is a bad ETH format ( missing 1 char)', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: "2000000",
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: "0xb55D0F87eE4a76fAa2f1d01A5abf3f1EB1bbFd6",
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.test_wallet_assertions,
      threshold: `${params.threshold}`,
      token: "USDC",
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Key: 'request.DestContractCall.ContractAddress' Error:Field validation for 'ContractAddress' failed on the 'eth_address' tag"); 
    });
  });

  it('Negative POST solution/call - Valid data using USDC from Sep to Base except gas limit set to 0', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: "2000000",
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 0,
        outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.test_wallet_assertions,
      threshold: `${params.threshold}`,
      token: "USDC",
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Key: 'request.DestContractCall.GasLimit' Error:Field validation for 'GasLimit' failed on the 'required' tag"); 
    });
  });

  it('Negative POST solution/call - Valid data using USDC from Sep to Base except type to an incorect value(fungilbe)', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: "2000000",
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.test_wallet_assertions,
      threshold: `${params.threshold}`,
      token: "USDC",
      type: "fungilbe",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Key: 'request.Type' Error:Field validation for 'Type' failed on the 'oneof' tag"); 
    });
  });

  it('POST solution/call - Valid response with ETH from Base to B3 using Sprinter contract for mintPayable method for ETH', function () {
    const data = {
      account: params.your_wallet,
      amount: params.b3_NFT_price_eth,
      destination: params.b3_chainID,
      destinationContractCall: {
        // approvalAddress: params.contract_ERC721_b3,
        callData: this.callData_eth_minPayable,
        contractAddress: params.contract_ERC721_b3,
        gasLimit: 420000,
        // outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.your_wallet,
      threshold: `${params.threshold}`,
      token: 'eth',
      type: "fungible",
      whitelistedSourceChains: [
        params.base_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(200); // Validate status code for created resource
      expect(response.body).to.have.property('data');
      expect(response.body.data[0].sourceChain).equal(params.base_chainID);
      expect(response.body.data[0].destinationChain).equal(params.b3_chainID);
      expect(response.body.data[0].amount).equal(`${params.b3_NFT_price_eth}`);
      expect(response.body.data[0]).to.have.property('transaction');
      expect(response.body.data[0].transaction.to).equal(params.base_native_contract);
      expect(response.body.data[0].transaction.value).not.to.equal("0x0");
      expect(response.body.data[0]).to.have.property('approvals').to.be.null;
    });
  });

  // POST  solution/call WETH + ETH
  it('POST solution/call - Valid response with ETH + WETH from Sepolia to B3 using Sprinter contract for mintPayable where TransferAmount (TA) > ETH AND TA < ETH + WETH  AND Treshold < remaining balance', function () {
    const data = {
      account: params.test_weth_wallet,
      amount: "200000000000000000",
      destination: params.b3_chainID,
      destinationContractCall: {
        // approvalAddress: params.contract_ERC721_b3,
        callData: this.callData_eth_minPayable,
        contractAddress: params.contract_ERC721_b3,
        gasLimit: 420000,
        // outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.test_weth_wallet,
      threshold: `1`,
      token: 'eth',
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(200); 
      expect(response.body).to.have.property('data');
     
      const unwrapObject = response.body.data.find((item: any) => item.destinationChain === params.sepolia_chainID);
      const depositObject = response.body.data.find((item: any) => item.destinationChain === params.b3_chainID);

      expect(unwrapObject.sourceChain).equal(params.sepolia_chainID);
      expect(unwrapObject.transaction.to).to.be.oneOf([params.sep_SYGMA_WETH_contract, params.sep_SPRINTER_WETH_contract]);
      expect(unwrapObject.transaction.value).equal("0x0");
      expect(unwrapObject.transaction.chainId).equal(params.sepolia_chainID);

      expect(depositObject.sourceChain).equal(params.sepolia_chainID);
      expect(depositObject.transaction.to).equals(params.sep_native_contract);
      expect(depositObject.transaction.value).not.to.equal("0x0");

      expect(response.body.data[0]).to.have.property('approvals').to.be.null;

    });
  });

  it('POST solution/call - Valid response with ETH + WETH from Sepolia to B3 using Sprinter contract for mintPayable where TransferAmount (TA) < ETH AND TA < ETH + WETH  AND Treshold < remaining balance', function () {
    const data = {
      account: params.test_weth_wallet,
      amount: "120000000000000000",
      destination: params.b3_chainID,
      destinationContractCall: {
        // approvalAddress: params.contract_ERC721_b3,
        callData: this.callData_eth_minPayable,
        contractAddress: params.contract_ERC721_b3,
        gasLimit: 420000,
        // outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.test_weth_wallet,
      threshold: `1`,
      token: 'eth',
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(200); 
      expect(response.body).to.have.property('data');

      expect(response.body.data[0].sourceChain).equal(params.sepolia_chainID);
      expect(response.body.data[0].destinationChain).equal(params.b3_chainID);
      expect(response.body.data[0].transaction.to).equal(params.sep_native_contract);
      expect(response.body.data[0].transaction.value).not.to.equal("0x0");
     
      expect(response.body.data[0]).to.have.property('approvals').to.be.null;

    });
  });

  it('Negative POST solution/call - Valid response with ETH + WETH from Sepolia to B3 using Sprinter contract for mintPayable where TransferAmount (TA) > ETH AND TA > ETH + WETH  AND Treshold = 1', function () {
    const data = {
      account: params.test_weth_wallet,
      amount: "350000000000000000",
      destination: params.b3_chainID,
      destinationContractCall: {
        // approvalAddress: params.contract_ERC721_b3,
        callData: this.callData_eth_minPayable,
        contractAddress: params.contract_ERC721_b3,
        gasLimit: 420000,
        // outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.test_weth_wallet,
      threshold: `1`,
      token: 'eth',
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode:false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(404); 
      expect(response.body).to.have.property('error').equals("No solution found");

    });
  });

  it('Negative POST solution/call - Valid response with ETH + WETH from Sepolia to B3 using Sprinter contract for mintPayable where TransferAmount (TA) > ETH AND TA > ETH + WETH  AND Treshold = 1', function () {
    const data = {
      account: "0x351657b100E8F3c7dA56f583FBb3582428f997e4",
      amount: "1000000000000000",
      destination: params.b3_chainID,
      destinationContractCall: {
        // approvalAddress: params.contract_ERC721_b3,
        callData: this.callData_eth_minPayable,
        contractAddress: params.contract_ERC721_b3,
        gasLimit: 420000,
        // outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.test_weth_wallet,
      threshold: `1`,
      token: 'eth',
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode:false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(404); 
      expect(response.body).to.have.property('error').equals("No solution found");
      expect(response.body).to.have.property('debug').contains("user doesn't have enough funds to execute solution\nacross");

    });
  });

  // BUG https://github.com/ChainSafe/sprinter-api/issues/282 
  it.skip('Negative POST solution/call - Valid response with ETH + WETH from Base to B3 using Sprinter contract for mintPayable where TransferAmount (TA) > ETH AND TA > ETH + WETH  AND Treshold = 1', function () {
    const data = {
      account: params.test_weth_wallet,
      amount: "70000000000000000",
      destination: params.b3_chainID,
      destinationContractCall: {
        // approvalAddress: params.contract_ERC721_b3,
        callData: this.callData_eth_minPayable,
        contractAddress: params.contract_ERC721_b3,
        gasLimit: 420000,
        // outputTokenAddress: params.base_USDC_contract
      },
      recipient: params.test_weth_wallet,
      threshold: `70000000000000000`,
      token: 'eth',
      type: "fungible",
      whitelistedSourceChains: [
        params.base_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solution/call`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode:false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(404); 
      expect(response.body).to.have.property('error').equals("No solution found");
      expect(response.body).to.have.property('debug').contains("user doesn't have enough funds to execute solution\nacross");

    });
  });

   // solutions/aggregation tests

  it('POST solutions/aggregation - Valid response with USDC from Sep and B3 to Base using Sprinter contract for claimName method for USDC amount transfer == contract call amount', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: `2000000`,
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      threshold: `${params.threshold}`,
      recipient: params.your_wallet,
      token: 'usdc',
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID,
        params.b3_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solutions/aggregation`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(200); // Validate status code for created resource
      expect(response.body).to.have.property('data');
      expect(response.body.data[0].sourceChain).to.be.oneOf([params.b3_chainID, params.sepolia_chainID]);
      expect(response.body.data[0].destinationChain).equal(params.base_chainID);
      expect(response.body.data[0].amount).equal(`2000000`);
      expect(response.body.data[0]).to.have.property('transaction');
      expect(response.body.data[0].transaction.to).to.be.oneOf([params.b3_bridge_contract,params.sep_bridge_contract]);
      expect(response.body.data[0].transaction.value).not.to.equal("0x0");
      expect(response.body.data[0]).to.have.property('approvals');
      expect(response.body.data[0].approvals[0].to).be.oneOf([params.b3_USDC_contract, params.sep_USDC_contract]);
      expect(response.body.data[0].approvals[0].value).equal('0x0');
      expect(response.body.data[0].approvals[0].chainId).to.be.oneOf([params.b3_chainID, params.sepolia_chainID]);
    });
  });

  it('POST solutions/aggregation - Valid response with USDC from Sep and B3 to Base using Sprinter contract for claimName method for USDC amount transfer > contract call amount', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: `4000000`,
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      threshold: `${params.threshold}`,
      recipient: params.your_wallet,
      token: 'usdc',
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID,
        params.b3_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solutions/aggregation`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(200); // Validate status code for created resource
      expect(response.body).to.have.property('data');
      expect(response.body.data[0].sourceChain).to.be.oneOf([params.b3_chainID, params.sepolia_chainID]);
      expect(response.body.data[0].destinationChain).equal(params.base_chainID);
      expect(response.body.data[0].amount).equal(`4000000`);
      expect(response.body.data[0]).to.have.property('transaction');
      expect(response.body.data[0].transaction.to).to.be.oneOf([params.b3_bridge_contract,params.sep_bridge_contract]);
      expect(response.body.data[0].transaction.value).not.to.equal("0x0");
      expect(response.body.data[0]).to.have.property('approvals');
      expect(response.body.data[0].approvals[0].to).be.oneOf([params.b3_USDC_contract, params.sep_USDC_contract]);
      expect(response.body.data[0].approvals[0].value).equal('0x0');
      expect(response.body.data[0].approvals[0].chainId).to.be.oneOf([params.b3_chainID, params.sepolia_chainID]);
    });
  });

  it('POST solutions/aggregation - Valid response with USDC from Sep and B3 to Base using Sprinter contract for claimName method for USDC with missing destinationContractCall param ', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: `2000000`,
      destination: params.base_chainID,
      // destinationContractCall: {
      //   approvalAddress: params.contract_Sprinter_base,
      //   callData: this.callData_usdc_2000000,
      //   contractAddress: params.contract_Sprinter_base,
      //   gasLimit: 420000,
      //   outputTokenAddress: params.base_USDC_contract
      // },
      threshold: `${params.threshold}`,
      recipient: params.your_wallet,
      token: 'usdc',
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID,
        params.b3_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solutions/aggregation`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(200); // Validate status code for created resource
      expect(response.body).to.have.property('data');
      expect(response.body.data[0].sourceChain).to.be.oneOf([params.b3_chainID, params.sepolia_chainID]);
      expect(response.body.data[0].destinationChain).equal(params.base_chainID);
      expect(response.body.data[0].amount).equal(`2000000`);
      expect(response.body.data[0]).to.have.property('transaction');
      expect(response.body.data[0].transaction.to).to.be.oneOf([params.b3_bridge_contract,params.sep_bridge_contract]);
      expect(response.body.data[0].transaction.value).not.to.equal("0x0");
      expect(response.body.data[0]).to.have.property('approvals');
      expect(response.body.data[0].approvals[0].to).to.be.oneOf([params.b3_USDC_contract,params.sep_USDC_contract]);
      expect(response.body.data[0].approvals[0].value).equal('0x0');
      expect(response.body.data[0].approvals[0].chainId).to.be.oneOf([params.b3_chainID, params.sepolia_chainID]);
    });
  });
  
  it('POST solutions/aggregation - Valid response with USDC from the same source as destination - BASE', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: `2000000`,
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      threshold: `${params.threshold}`,
      recipient: params.your_wallet,
      token: 'USDC',
      type: "fungible",
      whitelistedSourceChains: [
        params.base_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solutions/aggregation`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(200); // Validate status code for created resource
      expect(response.body).to.have.property('data');
      expect(response.body.data[0].sourceChain).equals(params.base_chainID);
      expect(response.body.data[0].destinationChain).equal(params.base_chainID);
      expect(response.body.data[0].amount).equal(`2000000`);
      expect(response.body.data[0]).to.have.property('transaction');
      expect(response.body.data[0].transaction.to).equals(params.contract_Sprinter_base);
      expect(response.body.data[0].transaction.value).not.to.equal("0x0");
      expect(response.body.data[0]).to.have.property('approvals').to.be.null;
    });
  });

  it('POST solutions/aggregation - Valid response with ETH from Base and B3 to Sepolia using Sprinter contract for ERC721 mintPayable method  for ETH amount transfer = contract call amount', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: `10000000`,
      destination: params.sepolia_chainID,
      destinationContractCall: {
        // approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_eth_minPayable,
        contractAddress: params.contract_ERC721_sep,
        gasLimit: 420000,
        // outputTokenAddress: params.base_USDC_contract
      },
      threshold: `${params.threshold}`,
      recipient: params.your_wallet,
      token: 'eth',
      type: "fungible",
      whitelistedSourceChains: [
        params.base_chainID,
        params.b3_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solutions/aggregation`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(200); // Validate status code for created resource
      expect(response.body).to.have.property('data');
      expect(response.body.data[0].sourceChain).to.be.oneOf([params.b3_chainID, params.base_chainID]);
      expect(response.body.data[0].destinationChain).equal(params.sepolia_chainID);
      expect(response.body.data[0].amount).equal(`10000000`);
      expect(response.body.data[0]).to.have.property('transaction');
      expect(response.body.data[0].transaction.to).to.be.oneOf([params.b3_native_contract, params.base_native_contract]);
      expect(response.body.data[0].transaction.value).not.to.equal("0x0");
      expect(response.body.data[0]).to.have.property('approvals').to.be.null;
    });
  });

  it('POST solutions/aggregation - Valid response with ETH from Base and B3 to Sepolia using Sprinter contract for ERC721 mintPayable method  for ETH amount transfer > contract call amount', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: `20000000`,
      destination: params.sepolia_chainID,
      destinationContractCall: {
        // approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_eth_minPayable,
        contractAddress: params.contract_ERC721_sep,
        gasLimit: 420000,
        // outputTokenAddress: params.base_USDC_contract
      },
      threshold: `${params.threshold}`,
      recipient: params.your_wallet,
      token: 'eth',
      type: "fungible",
      whitelistedSourceChains: [
        params.base_chainID,
        params.b3_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solutions/aggregation`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(200); // Validate status code for created resource
      expect(response.body).to.have.property('data');
      expect(response.body.data[0].sourceChain).to.be.oneOf([params.b3_chainID, params.base_chainID]);
      expect(response.body.data[0].destinationChain).equal(params.sepolia_chainID);
      expect(response.body.data[0].amount).equal(`20000000`);
      expect(response.body.data[0]).to.have.property('transaction');
      expect(response.body.data[0].transaction.to).to.be.oneOf([params.b3_native_contract, params.base_native_contract]);
      expect(response.body.data[0].transaction.value).not.to.equal("0x0");
      expect(response.body.data[0]).to.have.property('approvals').to.be.null;
    });
  });

  it('Negative POST solutions/aggregation - Valid response with USDC from Sep and B3 to Base using Sprinter except account being invalid', function () {
    const data = {
      account: "0x9A17FA0A2824EA855EC6aD3eAb3Aa2516EC662",
      amount: `2000000`,
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      threshold: `${params.threshold}`,
      recipient: params.your_wallet,
      token: 'usdc',
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID,
        params.b3_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solutions/aggregation`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Key: 'request.Account' Error:Field validation for 'Account' failed on the 'eth_address' tag"); 
    });
  });

  it('Negative POST solutions/aggregation - Valid response with USDC from Sep and B3 to Base using Sprinter except account being polkdot format', function () {
    const data = {
      account: "5GjowPEaFNnwbrmpPuDmBVdF2e7n3cHwk2LnUwHXsaW5KtEL",
      amount: `2000000`,
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      threshold: `${params.threshold}`,
      recipient: params.your_wallet,
      token: 'usdc',
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID,
        params.b3_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solutions/aggregation`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Key: 'request.Account' Error:Field validation for 'Account' failed on the 'eth_address' tag"); 
    });
  });

  it('Negative POST solutions/aggregation - Valid response with USDC from Sep and B3 to Base except missing call data field', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: `2000000`,
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        // callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      threshold: `${params.threshold}`,
      recipient: params.your_wallet,
      token: 'usdc',
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID,
        params.b3_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solutions/aggregation`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Key: 'request.DestContractCall.CallData' Error:Field validation for 'CallData' failed on the 'required' tag"); 
    });
  });

  it('Negative POST solutions/aggregation - Valid response with USDC from Sep and B3 to Base except token field being invalid USDP', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: `2000000`,
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      threshold: `${params.threshold}`,
      recipient: params.your_wallet,
      token: 'USDP',
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID,
        params.b3_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solutions/aggregation`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Key: 'request.Token' Error:Field validation for 'Token' failed on the 'supported_token' tag"); 
    });
  });

  it('Negative POST solutions/aggregation - Valid response with USDC from Sep and B3 to Base except amount > balance from that source', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: `200000000`,
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      threshold: `${params.threshold}`,
      recipient: params.your_wallet,
      token: 'USDC',
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID,
        params.b3_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solutions/aggregation`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property('error').equal("No solution found"); 
    });
  });

  it('Negative POST solutions/aggregation - Valid response with USDC from Sep and B3 to Base except amount = 0', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: `0`,
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      threshold: `${params.threshold}`,
      recipient: params.your_wallet,
      token: 'USDC',
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID,
        params.b3_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solutions/aggregation`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Key: 'request.Amount' Error:Field validation for 'Amount' failed on the 'big_gt' tag"); 
    });
  });

  it('Negative POST solutions/aggregation - Valid response with USDC from Sep and B3 to Base except amount using decimal', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: `0.23`,
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      threshold: `${params.threshold}`,
      recipient: params.your_wallet,
      token: 'USDC',
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID,
        params.b3_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solutions/aggregation`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Failed to convert string into big.int"); 
    });
  });

  it('Negative POST solutions/aggregation - Valid response with USDC from Sep and B3 to Base except amount set to string', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: `asdsad`,
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      threshold: `${params.threshold}`,
      recipient: params.your_wallet,
      token: 'USDC',
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID,
        params.b3_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solutions/aggregation`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Failed to convert string into big.int"); 
    });
  });

  it('Negative POST solutions/aggregation - Valid response with USDC from Sep and B3 to  an invalid destination but exiting in Sygma Shared Config (338 - Cronos)', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: `2000000`,
      destination: 338,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      threshold: `${params.threshold}`,
      recipient: params.your_wallet,
      token: 'USDC',
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID,
        params.b3_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solutions/aggregation`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Key: 'request.Destination' Error:Field validation for 'Destination' failed on the 'supported_chain' tag"); 
    });
  });

  it('Negative POST solutions/aggregation - Valid response with USDC from Sep and B3 to Base and invalid destination contract address ( missing one char)', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: `2000000`,
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: "0x3F9A68fF29B3d86a6928C44dF171A984F618000",
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      threshold: `${params.threshold}`,
      recipient: params.your_wallet,
      token: 'USDC',
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID,
        params.b3_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solutions/aggregation`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Key: 'request.DestContractCall.ContractAddress' Error:Field validation for 'ContractAddress' failed on the 'eth_address' tag"); 
    });
  });

  it('Negative POST solutions/aggregation - Valid response with USDC from Sep and B3 to Base all valid data, except gas limit set to 0', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: `2000000`,
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 0,
        outputTokenAddress: params.base_USDC_contract
      },
      threshold: `${params.threshold}`,
      recipient: params.your_wallet,
      token: 'USDC',
      type: "fungible",
      whitelistedSourceChains: [
        params.sepolia_chainID,
        params.b3_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solutions/aggregation`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Key: 'request.DestContractCall.GasLimit' Error:Field validation for 'GasLimit' failed on the 'required' tag"); 
    });
  });

  it('Negative POST solutions/aggregation - Valid response with USDC from Sep and B3 to Base all valid data, except type of an incorrect value "funligbe"', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: `2000000`,
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      threshold: `${params.threshold}`,
      recipient: params.your_wallet,
      token: 'USDC',
      type: "funligbe",
      whitelistedSourceChains: [
        params.sepolia_chainID,
        params.b3_chainID
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solutions/aggregation`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Key: 'request.Type' Error:Field validation for 'Type' failed on the 'oneof' tag"); 
    });
  });

  it('Negative POST solutions/aggregation - Valid response with USDC from invalid source, but exiting in Sygma Shared Config (338 - Cronos) to Base', function () {
    const data = {
      account: params.test_wallet_assertions,
      amount: `2000000`,
      destination: params.base_chainID,
      destinationContractCall: {
        approvalAddress: params.contract_Sprinter_base,
        callData: this.callData_usdc_2000000,
        contractAddress: params.contract_Sprinter_base,
        gasLimit: 420000,
        outputTokenAddress: params.base_USDC_contract
      },
      threshold: `${params.threshold}`,
      recipient: params.your_wallet,
      token: 'USDC',
      type: "fungible",
      whitelistedSourceChains: [
        338
      ]
    };

    cy.api({
      method: 'POST',
      url: `${baseUrl}/solutions/aggregation`,
      body: data,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(JSON.stringify(response.body));
      // Assertions
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error').equal("Key: 'request.WhitelistedSourceChains' Error:Field validation for 'WhitelistedSourceChains' failed on the 'supported_chains' tag"); 
    });
  });

});