import apiClient from './api.config';
import { ApiResponse } from '../types/api.types';
import { Offer } from '@/store/slices/offersSlice';

export const favoritesService = {
    /**
     * Get all favorites for the current user
     */
    getFavorites: async (): Promise<Offer[]> => {
        try {
            const response = await apiClient.get<ApiResponse<any[]>>('/users/getfavorites');

            // Transform the API response to match the Offer interface
            const transformedFavorites = response.data.data.map((apiOffer: any) => {
                // Extract brand info
                let brandName = 'Unknown Brand';
                let brandLogo: string | undefined = undefined;

                if (typeof apiOffer.brandid === 'string') {
                    brandName = apiOffer.brandid;
                } else if (apiOffer.brandid && typeof apiOffer.brandid === 'object') {
                    brandName = apiOffer.brandid.name || 'Unknown Brand';
                    brandLogo = apiOffer.brandid.logo;
                }

                // Extract category info
                let catName: string | undefined = undefined;
                let catId: string | undefined = undefined;

                if (apiOffer.categoryid) {
                    if (typeof apiOffer.categoryid === 'string') {
                        catId = apiOffer.categoryid;
                        catName = 'Unknown Category';
                    } else if (typeof apiOffer.categoryid === 'object') {
                        catId = apiOffer.categoryid.id || apiOffer.categoryid._id;
                        catName = apiOffer.categoryid.categoryName || apiOffer.categoryid.name || 'Unknown Category';
                    }
                }

                // Handle image URL
                let imageUrl: string | undefined = undefined;
                if (apiOffer.imgUrl) {
                    if (Array.isArray(apiOffer.imgUrl)) {
                        imageUrl = apiOffer.imgUrl.length > 0 ? apiOffer.imgUrl[0] : undefined;
                    } else if (typeof apiOffer.imgUrl === 'string') {
                        imageUrl = apiOffer.imgUrl;
                    }
                }

                const badgeColors: { [key: string]: string } = {
                    'TRENDING': '#FF6B6B',
                    'HOT DEAL': '#FF4444',
                    'BOGO': '#FFA500',
                    '50% OFF': '#9B59B6',
                    'FEATURED': '#4A90E2',
                    'default': '#4A90E2'
                };

                return {
                    id: apiOffer.id,
                    brand: brandName,
                    brandIcon: '🏷️',
                    brandLogo: brandLogo,
                    brandColor: badgeColors['default'],
                    title: apiOffer.title,
                    description: apiOffer.description,
                    badge: apiOffer.badge || 'DEAL',
                    badgeColor: badgeColors[apiOffer.badge || 'default'] || badgeColors['default'],
                    discount: apiOffer.discountPercentage ? `${apiOffer.discountPercentage}%` : undefined,
                    originalPrice: apiOffer.actualPrice?.toString(),
                    discountedPrice: apiOffer.discountedPrice?.toString(),
                    promoCode: apiOffer.promocode,
                    imageUrl: imageUrl,
                    category: catName,
                    categoryId: catId,
                    categoryName: catName,
                    isVerified: true,
                    isTrending: apiOffer.badge === "HOT DEAL" || apiOffer.badge === "TRENDING",
                    links: apiOffer.links,
                    hasWebsite: apiOffer.haswebsite,
                    isPhysical: apiOffer.isphysical,
                    tags: apiOffer.tags,
                    variants: apiOffer.varints,
                    images: Array.isArray(apiOffer.imgUrl) ? apiOffer.imgUrl : (apiOffer.imgUrl ? [apiOffer.imgUrl] : []),
                } as Offer;
            });

            return transformedFavorites;
        } catch (error) {
            console.error('Error fetching favorites:', error);
            throw error;
        }
    },

    /**
     * Toggle favorite status of an offer
     */
    toggleFavorite: async (offerId: string): Promise<{ message: string; isSuccess: boolean }> => {
        try {
            const response = await apiClient.post<ApiResponse<any>>('/users/togglefavorite', { offerId });
            return response.data;
        } catch (error) {
            console.error('Error toggling favorite:', error);
            throw error;
        }
    }
};
