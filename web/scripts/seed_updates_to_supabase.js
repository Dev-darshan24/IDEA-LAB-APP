const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  const key = parts[0];
  const vals = parts.slice(1);
  if (key && vals.length > 0) {
    env[key.trim()] = vals.join('=').trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL || 'https://yqxljnyyjqtajigucbcm.supabase.co';
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxeGxqbnl5anF0YWppZ3VjYmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NjczNjMsImV4cCI6MjEwMTM0MzM2M30.0CqYu-coQIoYbWF4WYoI9KYm_94Bk43JIUH3EgAsrXE';

const supabase = createClient(url, key);

const updatesFilePath = path.join(__dirname, '..', 'data', 'updates.json');

async function seedUpdates() {
  console.log('--- SEEDING UPDATES FROM web/data/updates.json TO SUPABASE ---');
  if (!fs.existsSync(updatesFilePath)) {
    console.error('File not found:', updatesFilePath);
    process.exit(1);
  }

  const fileData = JSON.parse(fs.readFileSync(updatesFilePath, 'utf8'));
  console.log(`Found ${fileData.length} items in web/data/updates.json:`);
  console.log(JSON.stringify(fileData, null, 2));

  for (const item of fileData) {
    const payload = {
      id: item.id,
      title: item.title,
      tag: item.tag || 'UPDATES',
      description: item.description || '',
      image_url: item.image_url || '',
      link_url: item.link_url || '',
      badge_color: item.badge_color || 'sky',
      is_active: item.is_active !== undefined ? item.is_active : true,
      display_order: item.display_order || 1,
      updated_at: item.updated_at || new Date().toISOString()
    };

    console.log(`Upserting item "${payload.title}" (${payload.id})...`);
    const { data, error } = await supabase.from('updates').upsert([payload], { onConflict: 'id' }).select();

    if (error) {
      console.error(`❌ Failed to upsert ${payload.id}:`, error.message);
    } else {
      console.log(`✅ Successfully upserted ${payload.id}:`, data);
    }
  }

  console.log('\n--- VERIFYING SUPABASE UPDATES DATA ---');
  const { data: allUpdates, error: fetchErr } = await supabase.from('updates').select('*');
  if (fetchErr) {
    console.error('❌ Failed to fetch updates:', fetchErr.message);
  } else {
    console.log(`✅ Total records in Supabase updates table: ${allUpdates.length}`);
    console.log(allUpdates);
  }
}

seedUpdates();
