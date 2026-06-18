/**
 * App-wide constants and configuration
 */

// API Configuration
// Change this to your local machine's IP address when testing on physical device
// Use 'localhost' for web, '10.0.2.2' for Android emulator, or your local IP for physical device
export const API_BASE_URL = 'http://192.168.1.14:3000';

// Location defaults for testing
export const DEFAULT_TEST_LOCATION = {
  lat: 18.5204,
  lng: 73.8567,
  name: 'Pune, India',
};

// Search defaults
export const DEFAULT_SEARCH_RADIUS_KM = 50;

// App info
export const APP_NAME = 'Mess Finder';
export const APP_VERSION = '1.0.0';
