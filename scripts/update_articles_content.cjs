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

    async function updateArticles() {
        // Read JSON
        const updatesPath = path.resolve(__dirname, 'article_updates.json');
        const updatesRaw = fs.readFileSync(updatesPath, 'utf8');
        const updates = JSON.parse(updatesRaw);

        console.log(`Starting update for ${updates.length} articles...`);

        for (const article of updates) {
            console.log(`Updating: ${article.title.substring(0, 30)}...`);

            const { error } = await supabase
                .from('knowledge_articles')
                .update({
                    content: article.content,
                    title: article.title // Also update title in case we optimized it
                })
                .eq('id', article.id);

            if (error) {
                console.error(`Error updating article ${article.id}:`, error);
            } else {
                console.log(`✅ Success: ${article.id}`);
            }
        }

        console.log('Update process completed.');
    }

    updateArticles();

} catch (err) {
    console.error('Error executing script:', err);
}
