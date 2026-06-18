// Quick test script to verify API connectivity
const axios = require('axios');

const testUrls = [
  'http://localhost:3000/messes/nearby?lat=18.5204&lng=73.8567&radius=50',
  'http://10.0.2.2:3000/messes/nearby?lat=18.5204&lng=73.8567&radius=50',
  'http://192.168.1.14:3000/messes/nearby?lat=18.5204&lng=73.8567&radius=50',
];

async function testApi() {
  console.log('🧪 Testing API connectivity...\n');
  
  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await axios.get(url, { timeout: 5000 });
      console.log(`✅ SUCCESS! Got ${response.data.messes?.length || 0} messes`);
      if (response.data.messes && response.data.messes.length > 0) {
        console.log(`   First mess: ${response.data.messes[0].name}`);
      }
      console.log('');
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      console.log('');
    }
  }
}

testApi();
