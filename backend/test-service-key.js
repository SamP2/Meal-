// Quick test to verify service role key is loaded
require('dotenv').config();

console.log('🔍 Checking environment variables...\n');

console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('\n✅ Service role key is loaded!');
  console.log('First 50 chars:', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 50) + '...');
} else {
  console.log('\n❌ Service role key is NOT loaded!');
  console.log('Make sure you:');
  console.log('1. Added SUPABASE_SERVICE_ROLE_KEY to backend/.env');
  console.log('2. Restarted the backend server');
}
