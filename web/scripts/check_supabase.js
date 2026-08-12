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

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Connecting to Supabase URL:', url);

const supabase = createClient(url, key);

const tables = [
  'profiles',
  'email_otps',
  'applications',
  'projects',
  'notifications',
  'lab_equipment',
  'gallery',
  'events',
  'lab_sections',
  'faculty_members',
  'lab_incharge',
  'chapter_members',
  'site_contact'
];

async function checkTables() {
  console.log('\n--- Checking Supabase Tables Status ---\n');
  const results = {};

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: false })
        .limit(5);

      if (error) {
        console.log(`❌ [${table}]: ERROR - ${error.code} | ${error.message} (${error.details || 'no details'})`);
        results[table] = { status: 'ERROR', error: error.message };
      } else {
        console.log(`✅ [${table}]: EXISTS - Record count: ${count ?? data?.length ?? 0} | Sample count: ${data?.length || 0}`);
        if (data && data.length > 0) {
          console.log(`   Sample item: ${JSON.stringify(data[0]).substring(0, 120)}...`);
        }
        results[table] = { status: 'OK', count: count ?? data?.length ?? 0 };
      }
    } catch (err) {
      console.log(`❌ [${table}]: EXCEPTION - ${err.message}`);
      results[table] = { status: 'EXCEPTION', error: err.message };
    }
  }

  console.log('\n--- Summary Table ---');
  console.table(results);
}

checkTables();
