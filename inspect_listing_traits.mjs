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

const url = "https://api.opensea.io/api/v2/listings/collection/anichess-ethernals/all?limit=1";
console.log(`Fetching ${url}...`);

try {
    const response = await fetch(url, {
        headers: {
            'x-api-key': apiKey,
            'accept': 'application/json'
        }
    });

    const data = await response.json();
    if (data.listings && data.listings.length > 0) {
        const l = data.listings[0];
        console.log("Listing found.");
        const item = l.protocol_data?.parameters?.offer?.[0]; // Seaport 1.5 structure usually
        // OpenSea API usually returns a processed 'item' object too?
        // Let's check keys of listing
        console.log("Listing Keys:", Object.keys(l));

        // Check for 'price' (current_price?)
        console.log("Price info:", l.price);

        // Check metadata in 'metadata' property usually
        if (l.metadata) {
            console.log("Metadata Keys:", Object.keys(l.metadata));
            // check attributes
        }

        // Wait, OpenSea listings response usually has trait info??
        // Let's dump the whole object deeply to find trait structure
        // usage of 'depth' not possible with simple console.log in node sometimes
        console.log(JSON.stringify(l, null, 2));

    } else {
        console.log("No listings found.");
    }
} catch (error) {
    console.error("Fetch error:", error);
}
