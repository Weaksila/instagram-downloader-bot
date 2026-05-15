const axios = require('axios');

async function test() {
    const url = 'https://www.instagram.com/reel/C7X3j5OIB0C/';
    const apis = [
        `https://api.lolhuman.xyz/api/instagram?apikey=8507bb151ad249054653a992&url=${encodeURIComponent(url)}`,
        `https://api.bot-zero.xyz/api/v1/igdl?url=${encodeURIComponent(url)}`,
        `https://api.vyturex.com/ig?url=${encodeURIComponent(url)}`
    ];

    for (const api of apis) {
        try {
            console.log(`Testing ${api}...`);
            const res = await axios.get(api, { timeout: 10000 });
            console.log(`Response:`, JSON.stringify(res.data).substring(0, 500));
            if (res.data && res.data.status === 200) break;
        } catch (err) {
            console.log(`Failed: ${err.message}`);
        }
    }
}

test();
