import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};
export const API_BASE_URL: string = extra.API_BASE_URL || 'http://localhost:4000';
export const GA4_MEASUREMENT_ID: string = extra.GA4_MEASUREMENT_ID || '';
export const GA4_API_SECRET: string = extra.GA4_API_SECRET || '';
export const GOOGLE_EXPO_CLIENT_ID: string = extra.GOOGLE_EXPO_CLIENT_ID || '';
export const FACEBOOK_APP_ID: string = extra.FACEBOOK_APP_ID || '';

export const DOWNLOAD_DIR = 'downloads';
