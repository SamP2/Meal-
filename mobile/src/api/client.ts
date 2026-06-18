import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { API_BASE_URL as FALLBACK_API_URL } from '../constants';

// Get API base URL from app.json extra config, fallback to constants
const BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || FALLBACK_API_URL;

// Production build verification logging
console.log('═══════════════════════════════════════════════════════');
console.log('🔧 API CLIENT INITIALIZATION');
console.log('═══════════════════════════════════════════════════════');
console.log('📱 Platform:', Platform.OS);
console.log('🏗️  Build Type:', __DEV__ ? 'DEVELOPMENT' : 'PRODUCTION');
console.log('📦 Expo Config Present:', !!Constants.expoConfig);
console.log('🔗 BASE_URL:', BASE_URL);
console.log('🔗 BASE_URL Type:', typeof BASE_URL);
console.log('🔗 BASE_URL Length:', BASE_URL?.length);
console.log('✅ BASE_URL is defined:', BASE_URL !== undefined);
console.log('✅ BASE_URL is not null:', BASE_URL !== null);
console.log('✅ BASE_URL is not empty:', BASE_URL !== '');

// Log all extra config for debugging
if (Constants.expoConfig?.extra) {
  console.log('📋 All Extra Config Keys:', Object.keys(Constants.expoConfig.extra));
  console.log('📋 apiBaseUrl:', Constants.expoConfig.extra.apiBaseUrl);
  console.log('📋 mapboxToken:', Constants.expoConfig.extra.mapboxToken ? '✅ Present' : '❌ Missing');
  console.log('📋 supabaseUrl:', Constants.expoConfig.extra.supabaseUrl ? '✅ Present' : '❌ Missing');
  console.log('📋 supabaseAnonKey:', Constants.expoConfig.extra.supabaseAnonKey ? '✅ Present' : '❌ Missing');
} else {
  console.warn('⚠️  No extra config found in Constants.expoConfig');
}

console.log('═══════════════════════════════════════════════════════');

// Validate BASE_URL before creating axios instance
if (!BASE_URL || BASE_URL === '' || BASE_URL === 'undefined') {
  console.error('❌ CRITICAL: BASE_URL is not properly configured!');
  console.error('❌ BASE_URL value:', BASE_URL);
  console.error('❌ This will cause all API requests to fail');
  console.error('❌ Please check app.json extra.apiBaseUrl configuration');
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

apiClient.interceptors.request.use((config) => {
  console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  console.log(`🔗 Full URL: ${config.baseURL}${config.url}`);
  
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
    console.log('🔐 Request with auth token (first 20 chars):', authToken.substring(0, 20) + '...');
  } else {
    console.log('⚠️ Request without auth token');
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.config?.url}`);
    console.error(`❌ Error Message:`, error.message);
    console.error(`❌ Error Response:`, error.response?.data);
    console.error(`❌ Status Code:`, error.response?.status);
    return Promise.reject(error);
  }
);

export default apiClient;
