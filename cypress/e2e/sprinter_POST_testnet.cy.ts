import 'cypress-plugin-api';
import { ethers }  from 'ethers';
const fs = require("fs");
require('dotenv').config({ path: 'cypress/fixtures/.env' });
/// <reference types="cypress" />

const params = {
  account:'0x9A17FA0A2824EA855EC6aD3eAb3Aa2516EC6626d',
  token: "usdc",
  destination_sepolia : 11155111, 
  destination_base : 84532, 
  destination_b3 : 1993,
  amount_usdc_sepolia : 547706632, // used in assertion 
  amount_usdc_base : 38516544, // used in assertion
  amount_usdc_b3 : 151336000, // used in assertion
  amount_eth_sepolia : 2809107513814005523, // used in assertion 
  amount_eth_base : 2018363942564477839, // used in assertion
  amount_eth_b3 : 386813089419334297, // used in assertion
  threshold : 1, //define them to pass
  whitelistedSourceChains : '11155111'
}

// Next to be updated
describe('Sprinter API Testing on Testnet for all POST calls', () => {
  const baseUrl = 'https://api.test.sprinter.buildwithsygma.com';


  it('POST request - Validate response status and created data', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/posts`,
      body: {
        title: 'foo',
        body: 'bar',
        userId: 1,
      },
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    }).then((response) => {
      // Assertions
      expect(response.status).to.eq(201); // Validate status code for created resource
      expect(response.body).to.have.property('title', 'foo'); // Validate response body data
    });
  });

});
