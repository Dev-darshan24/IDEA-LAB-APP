const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yqxljnyyjqtajigucbcm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxeGxqbnl5anF0YWppZ3VjYmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NjczNjMsImV4cCI6MjEwMTM0MzM2M30.0CqYu-coQIoYbWF4WYoI9KYm_94Bk43JIUH3EgAsrXE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseUpdates() {
  console.log('--- TESTING SUPABASE UPDATES TABLE ---');
  
  // 1. Select
  const { data: selectData, error: selectErr } = await supabase.from('updates').select('*');
  console.log('SELECT result:', { data: selectData, error: selectErr });

  // 2. Insert test
  const testItem = {
    id: `test-${Date.now()}`,
    title: 'Test Update Slide',
    tag: 'TEST',
    description: 'Testing Supabase persistence',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    link_url: '/apply',
    badge_color: 'sky',
    is_active: true,
    display_order: 99
  };

  const { data: upsertData, error: upsertErr } = await supabase.from('updates').upsert([testItem], { onConflict: 'id' }).select();
  console.log('UPSERT result:', { data: upsertData, error: upsertErr });

  // 3. Delete test item
  const { error: delErr } = await supabase.from('updates').delete().eq('id', testItem.id);
  console.log('DELETE result:', { error: delErr });

  // 4. Final Select
  const { data: finalData, error: finalErr } = await supabase.from('updates').select('*');
  console.log('FINAL SELECT result:', { data: finalData, error: finalErr });
}

testSupabaseUpdates();
