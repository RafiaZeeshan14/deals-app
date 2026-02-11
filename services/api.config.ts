import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - defaults to localhost, can be overridden with environment variable
// For mobile testing, use your computer's IP address instead of localhost
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 20000, // Increased timeout to 20 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token and handle path prefixing
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            // Ensure path starts with /api/v1 for backend routing
            if (config.url && !config.url.startsWith('/api/v1')) {
                const cleanUrl = config.url.startsWith('/') ? config.url : `/${config.url}`;
                config.url = `/api/v1${cleanUrl}`;
            }

            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
            const token = await AsyncStorage.getItem('@deals_app:token');
            if (token) {
                console.log('Attaching Token in Frontend:', token.substring(0, 10) + '...');
                config.headers.set('Authorization', `Bearer ${token}`);
            } else {
                console.log('No token found in AsyncStorage');
            }
        } catch (error) {
            console.error('Error fetching token from storage:', error);
        }
        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
    (response) => {
        console.log(`[API Response] ${response.status} from ${response.config.url}`);
        return response;
    },
    (error: AxiosError) => {
        const config = error.config;
        if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
            console.error(`[API Timeout] ${config?.method?.toUpperCase()} ${config?.url} timed out after 20s`);
        }

        if (error.response) {
            // Server responded with error
            console.error(`[API Server Error] ${error.response.status} from ${config?.url}:`, error.response.data);

            // Handle 401 Unauthorized globally
            if (error.response.status === 401) {
                console.warn('Unauthorized access - Clearing session');
                AsyncStorage.multiRemove([
                    '@deals_app:user',
                    '@deals_app:token'
                ]).catch(err => console.error('Error clearing storage:', err));
            }
            return Promise.reject(error);
        } else if (error.request) {
            // Request made but no response
            console.error(`[API Network Error] No response from ${config?.url}. Check if backend at ${API_BASE_URL} is reachable.`);
            console.error('Error Details:', error.message);
        } else {
            // Other errors
            console.error('[API Error]:', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;

