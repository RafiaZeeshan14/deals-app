import apiClient from './api.config';
import { ApiResponse, SubCategory } from '../types/api.types';

export const subCategoryService = {
    /**
     * Get all subcategories
     */
    getAllSubCategories: async (): Promise<SubCategory[]> => {
        try {
            const response = await apiClient.get<ApiResponse<SubCategory[]>>(
                '/subcategories/getallsubcategories'
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            throw error;
        }
    },

    /**
     * Get subcategory by ID
     */
    getSubCategoryById: async (id: string): Promise<SubCategory> => {
        try {
            const response = await apiClient.get<ApiResponse<SubCategory>>(
                `/subcategories/getsubcategorybyid/${id}`
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching subcategory by ID:', error);
            throw error;
        }
    },

    /**
     * Get subcategories by category ID
     */
    getSubCategoriesByCategoryId: async (categoryId: string): Promise<SubCategory[]> => {
        try {
            const response = await apiClient.get<ApiResponse<SubCategory[]>>(
                `/subcategories/getsubcategoriesbycategoryid/${categoryId}`
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching subcategories by category:', error);
            throw error;
        }
    },
};
