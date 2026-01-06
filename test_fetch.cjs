
const https = require('https');

const url = "https://api.coingecko.com/api/v3/coins/check?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log(data);
    });
}).on('error', (err) => {
    console.log("Error: " + err.message);
});
