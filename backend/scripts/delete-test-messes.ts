import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function deleteTestMesses() {
  console.log('🗑️  Deleting test messes...');
  
  // Delete the original test messes (not user-created ones)
  const testMessNames = [
    'Annapurna Executive Mess',
    'Royal Kitchen',
    'Saraswati Dining'
  ];

  const { data, error } = await supabase
    .from('messes')
    .delete()
    .in('name', testMessNames)
    .select();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`✅ Deleted ${data?.length || 0} test messes`);
  data?.forEach(mess => {
    console.log(`  - ${mess.name} (${mess.address})`);
  });
  
  console.log('\n📊 Remaining messes:');
  const { data: remaining } = await supabase
    .from('messes')
    .select('name, address, created_at')
    .order('created_at', { ascending: false });
  
  remaining?.forEach(mess => {
    console.log(`  - ${mess.name} (${mess.address})`);
  });
}

deleteTestMesses();
