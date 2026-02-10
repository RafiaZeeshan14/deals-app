import apiClient from './api.config';
import { ApiResponse, Banner } from '../types/api.types';

export const bannerService = {
    /**
     * Get all active banners
     */
    getAllBanners: async (): Promise<Banner[]> => {
        try {
            const response = await apiClient.get<ApiResponse<Banner[]>>(
                '/banners/getallbanners'
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching banners:', error);
            throw error;
        }
    },

    /**
     * Get banner by ID
     */
    getBannerById: async (id: string): Promise<Banner> => {
        try {
            const response = await apiClient.get<ApiResponse<Banner>>(
                `/banners/getbannerbyid/${id}`
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching banner by ID:', error);
            throw error;
        }
    },
};
