const https = require('https');
const fs = require('fs');
const path = require('path');

// 1. Get API Key
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
    console.error("No API Key found");
    process.exit(1);
}

// 3. Fetch Specific NFT 99
const tokenId = "99";
const contractAddress = "0x473989bf6409d21f8a7fdd7133a40f9251cc1839"; // Confirmed Address

const options = {
    hostname: 'api.opensea.io',
    path: `/api/v2/chain/ethereum/contract/${contractAddress}/nfts/${tokenId}`,
    method: 'GET',
    headers: {
        'x-api-key': apiKey,
        'accept': 'application/json'
    }
};

console.log(`Fetching NFT #${tokenId} from ${contractAddress}...`);
const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            console.log("Status:", res.statusCode);
            const json = JSON.parse(data);
            const nft = json.nft;
            if (nft) {
                console.log("Image URL:", nft.image_url);
                console.log("Preview URL:", nft.image_preview_url);
            } else {
                console.log("No NFT data found");
                console.log(json);
            }
        } catch (e) {
            console.error("Error parsing", e);
        }
    });
});

req.end();
