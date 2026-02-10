// API Response Types matching backend structure
export interface ApiResponse<T> {
    isSuccess: boolean;
    message: string;
    data: T;
}

// Category
export interface Category {
    id: string;
    name: string;
    categoryName: string;
    description?: string;
    subCategory?: string[];
    subcategoryid?: string[];
    brandid?: string[];
    brandName?: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Brand
export interface Brand {
    id: string;
    _id?: string;
    name: string;
    description?: string;
    logo?: string;
    website?: string;
    categoryName?: string | any; // Can be string or object
    subCategory?: string | any; // Can be string or object  
    categoryid?: string[];
    tags?: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Offer Location
export interface OfferLocation {
    branchid: string;
    address?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

// Offer
export interface Offer {
    id: string;
    brandid: string;
    categoryid: string;
    title: string;
    description: string;
    status: string;
    discountPercentage?: number;
    startDate: string;
    endDate: string;
    imgUrl?: string | string[];
    actualPrice?: number;
    discountedPrice?: number;
    haswebsite: boolean;
    isphysical: boolean;
    promocode?: string;
    links?: string[];
    tags?: string[];
    badge?: string;
    varints?: any[];
    locations?: OfferLocation[];
    createdAt: string;
    updatedAt: string;
}

// SubCategory
export interface SubCategory {
    id: string;
    name: string;
    subCategoryName: string;
    description?: string;
    categoryid: string;
    categoryName?: string;
    brandid?: string[];
    brandName?: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// User
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    preferences?: {
        brands?: string[];
        categories?: string[];
        subCategories?: string[];
    };
}
