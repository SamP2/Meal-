import axios from 'axios';

// On Android emulator, host machine is 10.0.2.2
// On physical device on same WiFi, use your PC's local IP
const isWeb = typeof document !== 'undefined';
const BASE_URL = isWeb ? 'http://localhost:3000' : 'http://192.168.1.14:3000';

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
  }
  return config;
});

export default apiClient;
