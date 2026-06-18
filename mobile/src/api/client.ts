import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { API_BASE_URL as FALLBACK_API_URL } from '../constants';

// Get API base URL from app.json extra config, fallback to constants
const BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || FALLBACK_API_URL;

console.log('🌐 API Client initialized');
console.log('📱 Platform:', Platform.OS);
console.log('🔗 BASE_URL:', BASE_URL);
console.log('🔧 Constants.expoConfig?.extra:', Constants.expoConfig?.extra);

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
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
    console.log('🔐 Request with auth token (first 20 chars):', authToken.substring(0, 20) + '...');
  } else {
    console.log('⚠️ Request without auth token');
  }
  return config;
});

export default apiClient;
