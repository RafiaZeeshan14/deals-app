import apiClient from './api.config';
import { ApiResponse, Category } from '../types/api.types';

export const categoryService = {
    /**
     * Get all categories
     */
    getAllCategories: async (): Promise<Category[]> => {
        try {
            const response = await apiClient.get<ApiResponse<Category[]>>(
                '/categories/getallcategories'
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    /**
     * Get category by ID
     */
    getCategoryById: async (id: string): Promise<Category> => {
        try {
            const response = await apiClient.get<ApiResponse<Category>>(
                `/categories/getcategorybyid/${id}`
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching category by ID:', error);
            throw error;
        }
    },
};
