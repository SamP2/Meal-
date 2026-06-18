import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function openAllMesses() {
  console.log('🔓 Opening all messes...');
  
  const { data, error } = await supabase
    .from('messes')
    .update({ is_open: true })
    .eq('is_open', false)
    .select();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`✅ Opened ${data?.length || 0} messes`);
  data?.forEach(mess => {
    console.log(`  - ${mess.name} (${mess.address})`);
  });
}

openAllMesses();
