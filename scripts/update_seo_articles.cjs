/**
 * สคริปต์อัปเดตเนื้อหาบทความใน Supabase
 * รันด้วย: node scripts/update_seo_articles.cjs
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// โหลด environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ไม่พบ SUPABASE_URL หรือ SUPABASE_SERVICE_ROLE_KEY');
  console.log('กรุณาตั้งค่าใน .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateArticles() {
  console.log('🚀 เริ่มอัปเดตบทความ SEO...\n');

  // อ่านไฟล์ JSON
  const articlesPath = path.join(__dirname, 'seo_articles_update.json');
  const articlesData = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));

  let successCount = 0;
  let errorCount = 0;

  for (const article of articlesData) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .update({
          content: article.content,
        })
        .eq('id', article.id);

      if (error) {
        console.error(`❌ ไม่สามารถอัปเดต "${article.title}":`, error.message);
        errorCount++;
      } else {
        console.log(`✅ อัปเดตสำเร็จ: ${article.title}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Error updating "${article.title}":`, err.message);
      errorCount++;
    }
  }

  console.log('\n========================================');
  console.log(`📊 สรุป: สำเร็จ ${successCount} | ล้มเหลว ${errorCount}`);
  console.log('========================================\n');

  if (errorCount === 0) {
    console.log('🎉 อัปเดตบทความ SEO เรียบร้อยทั้งหมด!');
  }
}

updateArticles().catch(console.error);
