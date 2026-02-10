import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - defaults to localhost, can be overridden with environment variable
// For mobile testing, use your computer's IP address instead of localhost
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token if available
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
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
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response) {
            // Server responded with error
            console.error('API Error:', error.response.status, error.response.data);

            // Handle 401 Unauthorized globally
            if (error.response.status === 401) {
                console.warn('Unauthorized access - Clearing session');
                AsyncStorage.multiRemove([
                    '@deals_app:user',
                    '@deals_app:token'
                ]).catch(err => console.error('Error clearing storage:', err));

                // You might want to trigger a Redux action here too, 
                // but since we want to keep api.config independent if possible,
                // we'll rely on the app detecting the missing token on re-render
                // or the user being redirected by the layout.
            }
            return Promise.reject(error);
        } else if (error.request) {
            // Request made but no response
            console.error('Network Error:', error.message);
        } else {
            // Other errors
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
