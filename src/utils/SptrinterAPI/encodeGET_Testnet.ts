namespace Get_Testnet {

const account = "0x9A17FA0A2824EA855EC6aD3eAb3Aa2516EC6626d";

export async function callApi() {
    const baseUrl = 'https://api.test.sprinter.buildwithsygma.com/solutions/aggregation';
    const params = new URLSearchParams({
        account: account,
        token: "USDC",
        amount: "2000000",
        destination: String(84532), // Convert number to string
        threshold: String(1),      // Convert number to string
        type: "fungible",
        whitelistedSourceChains: [338].join(',') // Convert array to string
    });

    const url = `${baseUrl}?${params.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
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
}

Get_Testnet.callApi();