const axios = require('axios');

async function test() {
    const url = 'https://www.instagram.com/reel/C7X3j5OIB0C/';
    const api = `https://ig.abhitools.eu.org/api/download?url=${encodeURIComponent(url)}`;
    
    try {
        console.log(`Testing ${api}...`);
        const res = await axios.get(api, { timeout: 10000 });
        console.log(`Response:`, JSON.stringify(res.data).substring(0, 500));
    } catch (err) {
        console.log(`Failed: ${err.message}`);
    }
}

test();
