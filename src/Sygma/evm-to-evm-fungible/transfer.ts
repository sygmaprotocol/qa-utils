import {
  Environment,
  EthereumConfig,
  Network,
  getSygmaScanLink,
  type Eip1193Provider,
} from "@buildwithsygma/core";
import {
  createFungibleAssetTransfer,
  FungibleTransferParams,
} from "@buildwithsygma/evm";
import { Wallet, providers } from "ethers";
import dotenv from "dotenv";
import Web3HttpProvider from "web3-providers-http";
import axios from "axios";

dotenv.config();

const fs = require("fs");

interface Domain {
  id: number;
  type: string;
}

const testDomainIDs: number[] = [2, 5, 10]; // all:  2,  5,  6,  8, 9, 10, 11, 15
const testResourceIds: string[] = [
  "0x0000000000000000000000000000000000000000000000000000000000001200"
];
let sharedEVMDomainIDs: number[] = [];
let sharedConfig: any;
let evmNetworks: Array<EthereumConfig> = [];

async function fetchRemoteFile(path: string): Promise<any> {
  try {
    const response = await axios.get(path);
    return response.data;
  } catch (error) {
    console.error("Error fetching remote file:", error);
    throw error;
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function setup() {
  const environment = process.env.SYGMA_ENV;
  const configPath =
    environment === "testnet"
      ? `https://chainbridge-assets-stage.s3.us-east-2.amazonaws.com/shared-config-test.json`
      : `https://sygma-assets-mainnet.s3.us-east-2.amazonaws.com/shared-config-mainnet.json`;

  // Fetch the shared config from the remote file
  sharedConfig = await fetchRemoteFile(configPath);

  // Extract EVM Domain IDs
  sharedEVMDomainIDs = sharedConfig.domains
    .filter((domain: Domain) => domain.type === "evm")
    .map((domain: Domain) => domain.id);

  // Extract EVM Networks
  evmNetworks = sharedConfig.domains.filter(
    (domain: EthereumConfig) => domain.type === Network.EVM
  ) as Array<EthereumConfig>;
}

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("Missing environment variable: PRIVATE_KEY");
}

const SOURCE_CHAIN_ID = 8333;

// const explorerUrls: Record<number, string> = {
//   [SOURCE_CHAIN_ID]: "https://sepolia.etherscan.io",
// };


const getTxExplorerUrl = (params: {
  txHash: string;
  chainId: number;
}): string => process.env[`SCAN_URL_${params.chainId}`] + `/tx/${params.txHash}`;

export async function erc20Transfer(
  SOURCE_CHAIN_IDs: number[],
  RESOURCE_IDs: string[]
): Promise<void> {
  for (const network of evmNetworks) {
    if (SOURCE_CHAIN_IDs.includes(network.id)) {
      for (const resouce of network.resources) {
        if (RESOURCE_IDs.includes(resouce.resourceId)) {
          const SourceCapID = network.caipId;
          const SourceChainID = network.chainId;
          const amountDecimals = (resouce.decimals as number) - 1;
          const web3Provider = new Web3HttpProvider(
            process.env[`PROVIDER_URL_${SourceChainID}`]
          );
          const ethersWeb3Provider = new providers.Web3Provider(web3Provider);
          const wallet = new Wallet(privateKey ?? "", ethersWeb3Provider);
          const sourceAddress = await wallet.getAddress();
          const destinationAddress = await wallet.getAddress();
          for (let network of evmNetworks) {
            if (SourceCapID !== network.caipId) {
              for (const resource of network.resources) {
                if (RESOURCE_IDs.includes(resource.resourceId)) {
                  const params: FungibleTransferParams = {
                    source: SourceCapID,
                    destination: network.caipId,
                    sourceNetworkProvider:
                      web3Provider as unknown as Eip1193Provider,
                    resource: resource.resourceId,
                    amount: BigInt(1) * BigInt(10 ** amountDecimals),
                    recipientAddress: destinationAddress,
                    sourceAddress: sourceAddress,
                    environment:process.env.SYGMA_ENV as Environment
                  };
                  console.log("Params", params)
                  const transfer = await createFungibleAssetTransfer(params);
                  const approvals = await transfer.getApprovalTransactions();
                  console.log(`Approving Tokens (${approvals.length})...`);

                  for (const approval of approvals) {
                    const response = await wallet.sendTransaction(approval);
                    await response.wait();
                    console.log(
                      `Approved, transaction: ${getTxExplorerUrl({
                        txHash: response.hash,
                        chainId: SourceChainID,
                      })}`
                    );
                  }
                  const transferTx = await transfer.getTransferTransaction();
                  const response = await wallet.sendTransaction(transferTx);
                  await response.wait();
                  console.log(
                    `Depositted, transaction:  ${getSygmaScanLink(
                      response.hash,
                      process.env.SYGMA_ENV as Environment
                    )}`
                  );
                  await wait(10000);
                }
              }
            }
          }
        }
      }
    }
  }
}

(async () => {
  await setup();
  erc20Transfer(testDomainIDs, testResourceIds);
})();
