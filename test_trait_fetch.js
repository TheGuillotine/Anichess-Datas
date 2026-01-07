const https = require('https');
const fs = require('fs');
const path = require('path');

// Try to read .env
let apiKey = '';
try {
    const envPath = path.resolve(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/VITE_OPENSEA_API_KEY=(.*)/);
    if (match) apiKey = match[1].trim();
} catch (e) {
    console.log("Could not read .env");
}

if (!apiKey) {
    console.error("No API Key found in .env");
    process.exit(1);
}

const contractAddress = "0x84041d8e6c469f64989635741f22384a";
const traitValue = "Special Effect";
// Encode properly: traits=Background%3ASpecial%20Effect
const urlPath = `/api/v2/chain/ethereum/contract/${contractAddress}/nfts?limit=10&traits=Background%3A${encodeURIComponent(traitValue)}`;

const options = {
    hostname: 'api.opensea.io',
    path: urlPath,
    method: 'GET',
    headers: {
        'x-api-key': apiKey,
        'accept': 'application/json'
    }
};

console.log(`Fetching: https://api.opensea.io${urlPath}`);

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            if (res.statusCode !== 200) {
                console.error(`Error: ${res.statusCode} ${data}`);
                return;
            }
            const json = JSON.parse(data);
            if (json.nfts) {
                console.log(`Found ${json.nfts.length} NFTs with trait "Special Effect"`);
                // Check for listing price in 'order_data' or similar?
                // OS V2 'nfts' response usually includes 'best_listing' logic? Not typically.
                // Let's inspect the first one.
                if (json.nfts.length > 0) {
                    console.log("First NFT keys:", Object.keys(json.nfts[0]));
                    // Dump the first NFT to check for price data
                    console.log(JSON.stringify(json.nfts[0], null, 2));
                }
            }
        } catch (e) {
            console.error("Parse error", e);
        }
    });
});

req.on('error', (e) => {
    console.error("Request error", e);
});

req.end();
