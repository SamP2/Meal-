import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function cleanupDuplicates() {
  console.log('🧹 Cleaning up duplicate messes...');

  // Fetch all messes
  const { data: allMesses, error } = await supabase
    .from('messes')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching messes:', error);
    return;
  }

  console.log(`📊 Total messes found: ${allMesses?.length || 0}`);

  if (!allMesses || allMesses.length === 0) {
    console.log('✅ No messes to clean up');
    return;
  }

  // Group by name and address to find duplicates
  const messMap = new Map<string, any[]>();
  
  allMesses.forEach((mess) => {
    const key = `${mess.name}-${mess.address}`;
    if (!messMap.has(key)) {
      messMap.set(key, []);
    }
    messMap.get(key)!.push(mess);
  });

  console.log(`🔍 Unique messes (by name+address): ${messMap.size}`);

  // Find and delete duplicates (keep the oldest one)
  let deletedCount = 0;
  
  for (const [key, messes] of messMap.entries()) {
    if (messes.length > 1) {
      console.log(`\n🔄 Found ${messes.length} duplicates for: ${key}`);
      
      // Keep the first (oldest) one, delete the rest
      const toKeep = messes[0];
      const toDelete = messes.slice(1);
      
      console.log(`  ✅ Keeping: ${toKeep.id} (created: ${toKeep.created_at})`);
      
      for (const mess of toDelete) {
        console.log(`  🗑️  Deleting: ${mess.id} (created: ${mess.created_at})`);
        
        const { error: deleteError } = await supabase
          .from('messes')
          .delete()
          .eq('id', mess.id);
        
        if (deleteError) {
          console.error(`    ❌ Error deleting ${mess.id}:`, deleteError.message);
        } else {
          console.log(`    ✅ Deleted successfully`);
          deletedCount++;
        }
      }
    }
  }

  console.log(`\n🎉 Cleanup complete!`);
  console.log(`📊 Deleted ${deletedCount} duplicate messes`);
  console.log(`✨ Remaining unique messes: ${messMap.size}`);
  
  process.exit(0);
}

cleanupDuplicates().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
