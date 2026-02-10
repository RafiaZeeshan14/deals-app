import apiClient from './api.config';
import { ApiResponse, Brand } from '../types/api.types';

export const brandService = {
    /**
     * Get all brands (admin view)
     */
    getAllBrands: async (): Promise<Brand[]> => {
        try {
            const response = await apiClient.get<ApiResponse<Brand[]>>(
                '/brands/getallbrands'
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching all brands:', error);
            throw error;
        }
    },

    /**
     * Get all brands for app (optimized for mobile)
     */
    getAllBrandsForApp: async (): Promise<Brand[]> => {
        try {
            const response = await apiClient.get<ApiResponse<Brand[]>>(
                '/brands/getallbrandsforapp'
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching brands for app:', error);
            throw error;
        }
    },

    /**
     * Get brand by ID
     */
    getBrandById: async (id: string): Promise<Brand> => {
        try {
            const response = await apiClient.get<ApiResponse<Brand>>(
                `/brands/getbrandbyid/${id}`
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching brand by ID:', error);
            throw error;
        }
    },

    /**
     * Get brands by category ID
     */
    getBrandsByCategoryId: async (categoryId: string): Promise<Brand[]> => {
        try {
            const response = await apiClient.get<ApiResponse<Brand[]>>(
                `/brands/getbrandsbycategoryid/${categoryId}`
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching brands by category:', error);
            throw error;
        }
    },

    /**
     * Get brands by tags
     */
    getBrandsByTags: async (tags: string[]): Promise<Brand[]> => {
        try {
            const response = await apiClient.post<ApiResponse<Brand[]>>(
                '/brands/getbrandsbytags',
                { tags }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching brands by tags:', error);
            throw error;
        }
    },
};
