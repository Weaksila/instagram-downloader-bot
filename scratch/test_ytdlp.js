const youtubedl = require('yt-dlp-exec');

async function test() {
    try {
        const url = 'https://www.instagram.com/reel/C7X3j5OIB0C/';
        console.log('Fetching URL...');
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noWarnings: true,
            noCallHome: true,
            noCheckCertificate: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true,
        });
        console.log('Direct URL:', output.url);
    } catch (err) {
        console.error('Error:', err);
    }
}

test();
