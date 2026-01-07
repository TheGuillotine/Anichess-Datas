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

const checkTrait = async (traitName) => {
    // URL Encode brackets: [ -> %5B, ] -> %5D
    // float_traits[NAME][min]=1&float_traits[NAME][max]=24
    const encodedName = encodeURIComponent(traitName);
    const query = `float_traits%5B${encodedName}%5D%5Bmin%5D=1&float_traits%5B${encodedName}%5D%5Bmax%5D=24`;
    const url = `https://api.opensea.io/api/v2/listings/collection/anichess-ethernals/all?limit=1&${query}`;

    console.log(`Checking trait "${traitName}"...`);
    // console.log("URL:", url);

    try {
        const response = await fetch(url, {
            headers: {
                'x-api-key': apiKey,
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.log(` -> Failed: ${response.status}`);
            return false;
        }

        const data = await response.json();
        if (data.listings && data.listings.length > 0) {
            console.log(` -> SUCCESS! Found ${data.listings.length} listings.`);
            console.log(` -> Price: ${data.listings[0].price.current.value}`);
            return true;
        } else {
            console.log(" -> No listings found (might be wrong trait name or no listings in range).");
            return false;
        }
    } catch (e) {
        console.error(" -> Error", e);
        return false;
    }
};

const main = async () => {
    const candidates = ["Rarity", "Rank", "Rarity Rank", "rarity", "rank"];
    for (const c of candidates) {
        if (await checkTrait(c)) break;
    }
};

main();
