const axios = require('axios');
const https = require('https');

async function test() {
    const url = 'https://www.instagram.com/reel/C7X3j5OIB0C/';
    const api = `https://api.tiklydown.eu.org/api/download/instagram?url=${encodeURIComponent(url)}`;
    
    try {
        console.log(`Testing ${api}...`);
        const res = await axios.get(api, { 
            timeout: 10000,
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });
        console.log(`Response:`, JSON.stringify(res.data).substring(0, 500));
    } catch (err) {
        console.log(`Failed: ${err.message}`);
        if (err.response) {
            console.log(`Status: ${err.response.status}`);
            console.log(`Data:`, err.response.data);
        }
    }
}

test();
