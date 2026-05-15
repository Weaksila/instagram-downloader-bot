const youtubedl = require('yt-dlp-exec');

async function test() {
    try {
        const url = 'https://www.instagram.com/reel/C7X3j5OIB0C/';
        console.log('Fetching URL with headers...');
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noWarnings: true,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        });
        console.log('Direct URL:', output.url);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
