const fs = require('fs');
const https = require('https');

const postId = 'b545b7d9-3af5-4df2-a85d-21822c7f729b';

try {
    // Read .env.local manually
    const envContent = fs.readFileSync('.env.local', 'utf8');

    // Simple regex parsing
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\n]+)["']?/);
    const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=["']?([^"'\n]+)["']?/);

    if (!urlMatch || !keyMatch) {
        console.error('Could not parse SUPABASE_URL or ANON_KEY from .env.local');
        process.exit(1);
    }

    const supabaseUrl = urlMatch[1].trim();
    const supabaseKey = keyMatch[1].trim();

    const apiUrl = `${supabaseUrl}/rest/v1/forum_posts?id=eq.${postId}&select=id`;

    console.log('Checking ID:', postId);

    const req = https.request(apiUrl, {
        method: 'GET',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
        }
    }, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (Array.isArray(json)) {
                    if (json.length > 0) {
                        console.log('RESULT: FOUND');
                        console.log('Data:', JSON.stringify(json, null, 2));
                    } else {
                        console.log('RESULT: NOT_FOUND');
                        console.log('Data:', JSON.stringify(json, null, 2));
                    }
                } else {
                    console.log('RESULT: ERROR (Response is not an array)');
                    console.log('Body:', data);
                }
            } catch (e) {
                console.log('RESULT: ERROR Parse');
                console.log('Body:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error('Request Error:', e);
    });

    req.end();

} catch (err) {
    console.error('Script Error:', err.message);
}
