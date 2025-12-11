const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually parse .env.local
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envVars[key.trim()] = value.trim().replace(/^"|"$/g, '');
        }
    });

    const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials in .env.local');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    async function fetchArticles() {
        const { data, error } = await supabase
            .from('knowledge_articles')
            .select('id, title, category, content')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching articles:', error);
            return;
        }

        console.log('Found articles:', data.length);
        const outputPath = path.resolve(__dirname, 'current_articles.json');
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log('Wrote articles to', outputPath);
    }

    fetchArticles();

} catch (err) {
    console.error('Error reading .env.local or executing script:', err);
}
