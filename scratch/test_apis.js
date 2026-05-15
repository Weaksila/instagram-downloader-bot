const axios = require('axios');

async function test() {
    const url = 'https://www.instagram.com/reel/C7X3j5OIB0C/';
    const apis = [
        `https://api.tiklydown.eu.org/api/download/instagram?url=${encodeURIComponent(url)}`,
        `https://api.vyturex.com/ig?url=${encodeURIComponent(url)}`,
        `https://dl-instagram.vercel.app/api/download?url=${encodeURIComponent(url)}`
    ];

    for (const api of apis) {
        try {
            console.log(`Testing ${api}...`);
            const res = await axios.get(api, { timeout: 5000 });
            console.log(`Response from ${api}:`, JSON.stringify(res.data).substring(0, 200));
            if (res.data) break;
        } catch (err) {
            console.log(`Failed ${api}: ${err.message}`);
        }
    }
}

test();
