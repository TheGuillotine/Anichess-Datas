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

const url = "https://api.opensea.io/api/v2/collection/anichess-ethernals/nfts?limit=3";
console.log(`Fetching ${url}...`);

try {
    const response = await fetch(url, {
        headers: {
            'x-api-key': apiKey,
            'accept': 'application/json'
        }
    });

    if (!response.ok) {
        console.error(`Error: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error(text);
        process.exit(1);
    }

    const data = await response.json();
    if (data.nfts) {
        console.log(`Fetched ${data.nfts.length} NFTs.`);
        data.nfts.forEach((nft, i) => {
            console.log(`\n--- NFT #${i} ---`);
            console.log("Keys:", Object.keys(nft));
            if (nft.metadata) {
                console.log("Metadata Keys:", Object.keys(nft.metadata));
                if (nft.metadata.traits || nft.metadata.attributes) {
                    console.log("Traits found in metadata!");
                    const traits = nft.metadata.traits || nft.metadata.attributes;
                    traits.forEach(t => console.log(`Trait: "${t.trait_type}" = "${t.value}"`));
                }
            }
            if (nft.traits) {
                // Already checked, but just in case
                nft.traits.forEach(t => console.log(`Trait (root): "${t.trait_type}" = "${t.value}"`));
            }
        });
    }
} catch (error) {
    console.error("Fetch error:", error);
}
