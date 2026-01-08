import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let apiKey = '';
try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/VITE_OPENSEA_API_KEY=(.*)/);
        if (match) apiKey = match[1].trim();
    }
} catch (e) { }

const checkQuery = async (name, query) => {
    const url = `https://api.opensea.io/api/v2/listings/collection/anichess-ethernals/all?limit=1&${query}`;
    // console.log(`Testing ${name}...`);
    try {
        const res = await fetch(url, { headers: { 'x-api-key': apiKey } });
        const data = await res.json();
        if (data.listings && data.listings.length > 0) {
            console.log(`[${name}] Returned ${data.listings.length} listing(s). Price: ${data.listings[0].price.current.value}`);
        } else {
            console.log(`[${name}] No listings found.`);
        }
    } catch (e) {
        console.log(`[${name}] Error.`);
    }
};

const main = async () => {
    // 1. Valid param but impossible value?
    // float_traits[Rarity][min]=1&float_traits[Rarity][max]=24
    await checkQuery("Rarity Filter (1-24)", "float_traits%5BRarity%5D%5Bmin%5D=1&float_traits%5BRarity%5D%5Bmax%5D=24");

    // 2. Impossible Trait Name
    await checkQuery("Impossible Trait", "float_traits%5BXYZNONEXISTENT%5D%5Bmin%5D=1&float_traits%5BXYZNONEXISTENT%5D%5Bmax%5D=24");

    // 3. String Trait Match for Void
    // traits[Background]=Void
    await checkQuery("Background: Void", "traits%5BBackground%5D=Void");
};

main();
