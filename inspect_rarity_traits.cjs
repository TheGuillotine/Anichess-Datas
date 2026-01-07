const https = require('https');
const fs = require('fs');
const path = require('path');

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

// Fetch a few NFTs to inspect traits
const options = {
    hostname: 'api.opensea.io',
    path: '/api/v2/collection/anichess-ethernals/nfts?limit=3',
    method: 'GET',
    headers: {
        'x-api-key': apiKey,
        'accept': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.nfts) {
                console.log(`Fetched ${json.nfts.length} NFTs.`);
                if (json.nfts.length > 0) {
                    console.log("\nFULL NFT OBJECT (first item):");
                    console.log(JSON.stringify(json.nfts[0], null, 2));
                }
                json.nfts.forEach((nft, i) => {
                    console.log(`\n[NFT #${i}] ID: ${nft.identifier}`);
                    if (nft.traits) {
                        nft.traits.forEach(t => {
                            // Log all traits, looking for "Rarity", "Rank", or the "Void"/"Special Effect" indicators
                            console.log(`   Trait: ${t.trait_type} = ${t.value} (display: ${t.display_type})`);
                        });
                    }
                    if (nft.rarity) {
                        console.log(`   Top-level Rarity:`, nft.rarity);
                    }
                });
            } else {
                console.log("No NFTs found.", json);
            }
        } catch (e) {
            console.error("Parse error:", e);
        }
    });
});

req.on('error', (e) => console.error(e));
req.end();
