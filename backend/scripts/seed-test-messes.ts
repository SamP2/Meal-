import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const TEST_MESSES = [
  {
    name: 'Annapurna Executive Mess',
    address: 'Shivaji Nagar, Pune',
    latitude: 18.5304,
    longitude: 73.8467,
    opening_time: '08:00',
    closing_time: '22:00',
    price_range: '₹120-150',
    is_open: true,
    cuisine: 'Maharashtrian',
    description: 'Authentic Maharashtrian flavors with unlimited rotis',
    is_veg: true,
    is_verified: true,
    rating: 4.6,
    review_count: 45,
  },
  {
    name: 'Royal Kitchen',
    address: 'Kothrud, Pune',
    latitude: 18.5074,
    longitude: 73.8077,
    opening_time: '07:00',
    closing_time: '21:00',
    price_range: '₹90-120',
    is_open: true,
    cuisine: 'North Indian',
    description: 'Delicious North Indian meals with home-style cooking',
    is_veg: false,
    is_verified: true,
    rating: 4.8,
    review_count: 67,
  },
  {
    name: 'Saraswati Dining',
    address: 'Deccan, Pune',
    latitude: 18.5167,
    longitude: 73.8422,
    opening_time: '08:30',
    closing_time: '20:30',
    price_range: '₹110-140',
    is_open: false,
    cuisine: 'Pure Veg',
    description: 'Pure vegetarian meals with traditional recipes',
    is_veg: true,
    is_verified: false,
    rating: 4.2,
    review_count: 32,
  },
];

async function seedMesses() {
  console.log('🌱 Seeding test messes...');

  // First, get or create a test owner
  const testEmail = 'testowner@messfinder.com';
  const testPassword = 'testpass123';

  console.log('👤 Creating test owner account...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: { role: 'mess_owner' },
    },
  });

  if (authError && !authError.message.includes('already registered')) {
    console.error('❌ Error creating owner:', authError);
    return;
  }

  let ownerId: string;

  if (authData.user) {
    ownerId = authData.user.id;
    console.log('✅ Owner created:', ownerId);

    // Insert profile
    await supabase.from('profiles').upsert({ id: ownerId, role: 'mess_owner' });
  } else {
    // Owner already exists, sign in to get ID
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError || !signInData.user) {
      console.error('❌ Error signing in:', signInError);
      return;
    }

    ownerId = signInData.user.id;
    console.log('✅ Using existing owner:', ownerId);
  }

  // Insert messes
  console.log('🍽️ Inserting messes...');
  for (const mess of TEST_MESSES) {
    const { data, error } = await supabase
      .from('messes')
      .insert({ ...mess, owner_id: ownerId })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error inserting ${mess.name}:`, error.message);
    } else {
      console.log(`✅ Inserted: ${mess.name} (${data.id})`);
    }
  }

  console.log('🎉 Seeding complete!');
  process.exit(0);
}

seedMesses().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
