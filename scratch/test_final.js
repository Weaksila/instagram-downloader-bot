const { instagramGetUrl } = require('instagram-url-direct');
const axios = require('axios');
const https = require('https');

async function test() {
    const url = 'https://www.instagram.com/reel/DXgnlT0EgCu/';
    console.log('Testing URL:', url);

    // Method 1: instagram-url-direct
    console.log('--- Method 1: instagram-url-direct ---');
    try {
        const results = await instagramGetUrl(url);
        console.log('Method 1 results:', JSON.stringify(results, null, 2));
    } catch (e) {
        console.log('Method 1 failed:', e.message);
    }

    // Method 2: TiklyDown
    console.log('\n--- Method 2: TiklyDown ---');
    try {
        const tiklyRes = await axios.get(`https://api.tiklydown.eu.org/api/download/instagram?url=${encodeURIComponent(url)}`, {
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            timeout: 10000
        });
        console.log('Method 2 status:', tiklyRes.status);
        console.log('Method 2 data:', JSON.stringify(tiklyRes.data, null, 2));
    } catch (e) {
        console.log('Method 2 failed:', e.message);
    }

    // Method 3: Vyturex
    console.log('\n--- Method 3: Vyturex ---');
    try {
        const backupRes = await axios.get(`https://api.vyturex.com/ig?url=${encodeURIComponent(url)}`, { timeout: 10000 });
        console.log('Method 3 status:', backupRes.status);
        console.log('Method 3 data:', JSON.stringify(backupRes.data, null, 2));
    } catch (e) {
        console.log('Method 3 failed:', e.message);
    }
}

test();
