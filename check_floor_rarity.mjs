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

// Fetch the cheapest listing overall
const url = "https://api.opensea.io/api/v2/listings/collection/anichess-ethernals/all?limit=1&sort_by=price";
console.log(`Checking the traits of the absolute floor NFT...`);

try {
    const response = await fetch(url, {
        headers: {
            'x-api-key': apiKey,
            'accept': 'application/json'
        }
    });

    if (!response.ok) {
        console.error(`Error: ${response.status} ${response.statusText}`);
        process.exit(1);
    }

    const data = await response.json();
    if (data.listings && data.listings.length > 0) {
        const listing = data.listings[0];
        const item = listing.protocol_data?.parameters?.offer?.[0];
        const tokenId = item?.identifierOrCriteria;
        const contract = item?.token || "0x47392F8d55a305fD1C279093863777d13f181839";

        console.log(`Floor Price: ${listing.price.current.value} (wei)`);
        console.log(`Token ID: ${tokenId}`);
        console.log(`Contract: ${contract}`);

        // Now fetch that specific NFT to see its traits
        if (tokenId) {
            console.log("Fetching detailed traits for this Token ID...");
            const nftUrl = `https://api.opensea.io/api/v2/chain/ethereum/contract/${contract}/nfts/${tokenId}`;
            const nftRes = await fetch(nftUrl, { headers: { 'x-api-key': apiKey } });

            if (nftRes.ok) {
                const nftData = await nftRes.json();
                const traits = nftData.nft.traits || [];

                console.log("\n--- TRAITS ON FLOOR NFT ---");
                // Dump ALL traits
                traits.forEach(t => console.log(`[${t.trait_type}]: ${t.value}`));

                // Also check specifically for Rarity Rank field if it exists detached
                console.log("\n--- RARITY OBJECT ---");
                if (nftData.nft.rarity) {
                    console.log(JSON.stringify(nftData.nft.rarity, null, 2));
                }
            } else {
                console.log("Failed to fetch NFT details:", nftRes.status);
            }
        }

    } else {
        console.log("No listings found.");
    }
} catch (error) {
    console.error("Fetch error:", error);
}
