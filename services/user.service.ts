import apiClient from './api.config';

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role?: string;
}

export interface AuthResponse {
    isSuccess: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    } | null;
}

export const userService = {
    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const response = await apiClient.post('/users/login', { email, password });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { isSuccess: false, message: 'Login failed' };
        }
    },

    async signup(userData: { firstName: string; lastName: string; email: string; password: string; phoneNumber: number; gender: number }): Promise<AuthResponse> {
        try {
            const response = await apiClient.post('/users/signup', userData);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { isSuccess: false, message: 'Signup failed' };
        }
    },

    async getProfile(token: string): Promise<AuthResponse> {
        try {
            const response = await apiClient.get('/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { isSuccess: false, message: 'Failed to fetch profile' };
        }
    },

    async updateLocation(latitude: number, longitude: number, token: string): Promise<any> {
        try {
            const response = await apiClient.put('/users/updatelocation',
                { latitude, longitude },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error: any) {
            console.error('Update location error:', error);
            // Don't throw for location updates, just return null
            return null;
        }
    },

    async logout(token: string): Promise<any> {
        try {
            const response = await apiClient.post('/users/logout', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            // Even if API fails, we should clear local state
            return { isSuccess: true };
        }
    }
};
