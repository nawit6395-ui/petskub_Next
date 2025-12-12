const fs = require('fs');
const https = require('https');

try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\n]+)["']?/);
    const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=["']?([^"'\n]+)["']?/);

    if (!urlMatch || !keyMatch) process.exit(1);

    const supabaseUrl = urlMatch[1].trim();
    const supabaseKey = keyMatch[1].trim();

    const apiUrl = `${supabaseUrl}/rest/v1/forum_posts?select=id,title,slug,created_at&order=created_at.desc&limit=5`;

    const req = https.request(apiUrl, {
        method: 'GET',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
        }
    }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log('Last 5 Posts:', JSON.stringify(JSON.parse(data), null, 2));
        });
    });
    req.on('error', console.error);
    req.end();

} catch (err) {
    console.error(err);
}
