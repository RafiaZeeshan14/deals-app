import apiClient from './api.config';
import { ApiResponse, Offer } from '../types/api.types';

export const offerService = {
    /**
     * Get all offers
     */
    getAllOffers: async (): Promise<Offer[]> => {
        try {
            const response = await apiClient.get<ApiResponse<Offer[]>>(
                '/offers/getalloffers'
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching all offers:', error);
            throw error;
        }
    },

    /**
     * Get offer by ID
     */
    getOfferById: async (id: string): Promise<Offer> => {
        try {
            const response = await apiClient.get<ApiResponse<Offer>>(
                `/offers/getofferbyid/${id}`
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching offer by ID:', error);
            throw error;
        }
    },

    /**
     * Get offers by badge (e.g., "TRENDING", "HOT DEAL", "BOGO")
     */
    getOffersByBadge: async (badge: string): Promise<Offer[]> => {
        try {
            const encodedBadge = encodeURIComponent(badge);
            const response = await apiClient.get<ApiResponse<Offer[]>>(
                `/offers/getoffersbybadge/${encodedBadge}`
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching offers by badge:', error);
            throw error;
        }
    },

    /**
     * Get offers by category ID
     */
    getOffersByCategoryId: async (categoryId: string): Promise<Offer[]> => {
        try {
            const response = await apiClient.get<ApiResponse<Offer[]>>(
                `/offers/getoffersbycategoryid/${categoryId}`
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching offers by category:', error);
            throw error;
        }
    },

    /**
     * Get offers by brand ID
     */
    getOffersByBrandId: async (brandId: string, lat?: number, long?: number): Promise<Offer[]> => {
        try {
            let url = `/offers/getoffersbybrand/${brandId}`;
            if (lat && long) {
                url += `?lat=${lat}&long=${long}`;
            }
            const response = await apiClient.get<ApiResponse<Offer[]>>(url);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching offers by brand:', error);
            throw error;
        }
    },

    /**
     * Get offers near user location
     */
    getOffersNearMe: async (userId: string, maxDistance?: number): Promise<Offer[]> => {
        try {
            let url = `/offers/near-me/${userId}`;
            if (maxDistance) {
                url += `?maxDistance=${maxDistance}`;
            }
            const response = await apiClient.get<ApiResponse<Offer[]>>(url);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching offers near me:', error);
            throw error;
        }
    },
};
