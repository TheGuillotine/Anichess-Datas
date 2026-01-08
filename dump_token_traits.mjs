import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load API Key
let apiKey = '';
try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/VITE_OPENSEA_API_KEY=(.*)/);
        if (match) apiKey = match[1].trim();
    }
} catch (e) { }

if (!apiKey) {
    console.error("API Key not found or empty.");
    process.exit(1);
}

// Token ID 99 (from previous step, the current floor)
const contract = "0x47392F8d55a305fD1C279093863777d13f181839";
const tokenId = "99";

const url = `https://api.opensea.io/api/v2/chain/ethereum/contract/${contract}/nfts/${tokenId}`;
console.log(`Fetching details for Token ID ${tokenId}...`);

try {
    const response = await fetch(url, {
        headers: {
            'x-api-key': apiKey,
            'accept': 'application/json'
        }
    });

    if (!response.ok) {
        console.error(`Error: ${response.status}`);
        process.exit(1);
    }

    const data = await response.json();
    const nft = data.nft;

    console.log("\nTRAITS:");
    if (nft.traits) {
        nft.traits.forEach(t => {
            console.log(` - [${t.trait_type}]: ${t.value} (display: ${t.display_type})`);
        });
    }

    console.log("\nRARITY OBJECT:");
    if (nft.rarity) {
        console.log(JSON.stringify(nft.rarity, null, 2));
    } else {
        console.log("None");
    }

} catch (error) {
    console.error("Fetch error:", error);
}
