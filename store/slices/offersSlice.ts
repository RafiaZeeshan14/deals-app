import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { initialAllOffers, initialCategories, initialPopularBrands, initialTrendingOffers } from '@/utils/data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { offerService } from '@/services/offer.service';
import { categoryService } from '@/services/category.service';
import { brandService } from '@/services/brand.service';
import { Offer as ApiOffer, Category as ApiCategory, Brand as ApiBrand } from '@/types/api.types';

export interface Offer {
  id: string;
  brand: string;
  brandIcon: string;
  brandLogo?: string;
  brandColor: string;
  title: string;
  description?: string;
  badge: string;
  badgeColor: string;
  discount?: string;
  originalPrice?: string;
  discountedPrice?: string;
  category?: string; // Kept for backward compatibility, will match categoryName
  categoryId?: string;
  categoryName?: string;
  expiryDate?: string;
  timeLeft?: string;
  promoCode?: string;
  imageUrl?: string;
  isVerified?: boolean;
  isTrending?: boolean;
  usedCount?: number;
  links?: string[];
  hasWebsite?: boolean;
  isPhysical?: boolean;
  tags?: string[];
  variants?: { size: string; colour: string; _id: string }[];
  images?: string[];
}

interface OffersState {
  offers: Offer[];
  trendingOffers: Offer[];
  popularBrands: Array<{
    id: string;
    name: string;
    icon: string;
    deals: number;
    color: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    count: number;
    color: string;
  }>;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filterCategory: string | null;
  sortBy: 'recent' | 'discount' | 'popular';
}

// Helper function to transform API offer to app offer format
const transformApiOfferToAppOffer = (apiOffer: ApiOffer): Offer => {
  // ... brand logic ...
  // ... brand logic ...

  // Safely extract brand name and logo - handle both string ID and populated object
  let brandName = 'Unknown Brand';
  let brandLogo: string | undefined = undefined;

  if (typeof apiOffer.brandid === 'string') {
    brandName = apiOffer.brandid;
  } else if (apiOffer.brandid && typeof apiOffer.brandid === 'object') {
    // brandid is populated as an object
    const brandObj = apiOffer.brandid as any;
    brandName = brandObj.name || 'Unknown Brand';
    brandLogo = brandObj.logo;
  }

  // Handle imgUrl - it might be a string or an array
  let imageUrl: string | undefined = undefined;
  if (apiOffer.imgUrl) {
    if (Array.isArray(apiOffer.imgUrl)) {
      // If it's an array, take the first URL
      imageUrl = apiOffer.imgUrl.length > 0 ? apiOffer.imgUrl[0] : undefined;
    } else if (typeof apiOffer.imgUrl === 'string') {
      // If it's already a string, use it directly
      imageUrl = apiOffer.imgUrl;
    }
  }

  // Handle categoryid - separate Logic ID vs Display Name
  let catId: string | undefined = undefined;
  let catName: string | undefined = undefined;

  if (apiOffer.categoryid) {
    if (typeof apiOffer.categoryid === 'string') {
      catId = apiOffer.categoryid;
      // If we only have ID, name might be unknown unless we look it up, 
      // but for now let's hope it's populated often.
      catName = 'Unknown Category';
    } else if (typeof apiOffer.categoryid === 'object') {
      // categoryid is populated as an object
      const catObj = apiOffer.categoryid as any;
      catId = catObj.id || catObj._id;
      catName = catObj.categoryName || catObj.name || 'Unknown Category';
    }
  }

  const brandEmojis: { [key: string]: string } = {
    'Fashion': '👗',
    'Food': '🍔',
    'Electronics': '📱',
    'default': '🏷️'
  };

  const badgeColors: { [key: string]: string } = {
    'TRENDING': '#FF6B6B',
    'HOT DEAL': '#FF4444',
    'BOGO': '#FFA500',
    '50% OFF': '#9B59B6',
    'default': '#4A90E2'
  };

  return {
    id: apiOffer.id,
    brand: brandName,
    brandIcon: brandEmojis['default'],
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
    category: catName, // Legacy prop for display
    categoryId: catId, // New prop for logic/filtering
    categoryName: catName, // New prop for display
    isVerified: true,
    isTrending: apiOffer.badge === "HOT DEAL" || apiOffer.badge === "TRENDING",
    links: apiOffer.links,
    hasWebsite: apiOffer.haswebsite,
    isPhysical: apiOffer.isphysical,
    tags: apiOffer.tags,
    variants: apiOffer.varints,
    images: Array.isArray(apiOffer.imgUrl) ? apiOffer.imgUrl : (apiOffer.imgUrl ? [apiOffer.imgUrl] : []),
  };
};

// Async thunks for fetching data from API
export const fetchAllOffers = createAsyncThunk(
  'offers/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const apiOffers = await offerService.getAllOffers();
      return apiOffers.map(transformApiOfferToAppOffer);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch offers');
    }
  }
);

export const fetchTrendingOffers = createAsyncThunk(
  'offers/fetchTrending',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch offers with TRENDING badge
      const apiOffers = await offerService.getOffersByBadge('TRENDING');
      return apiOffers.map(transformApiOfferToAppOffer);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch trending offers');
    }
  }
);

export const fetchOffersByCategory = createAsyncThunk(
  'offers/fetchByCategory',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const apiOffers = await offerService.getOffersByCategoryId(categoryId);
      return apiOffers.map(transformApiOfferToAppOffer);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch offers');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'offers/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const apiCategories = await categoryService.getAllCategories();
      return apiCategories.map((cat: ApiCategory) => ({
        id: cat.id,
        name: cat.name,
        icon: '📦', // Default icon, you can map specific icons
        count: 0, // You might want to count offers per category
        color: '#4A90E2'
      }));
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch categories');
    }
  }
);

export const fetchAllBrands = createAsyncThunk(
  'offers/fetchAllBrands',
  async (_, { rejectWithValue }) => {
    try {
      const apiBrands = await brandService.getAllBrands();
      return apiBrands.map((brand: ApiBrand) => ({
        id: brand.id || brand._id || '',
        name: brand.name,
        icon: brand.logo || '🏢',
        deals: 0,
        color: '#FFFFFF'
      }));
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch brands');
    }
  }
);

const initialState: OffersState = {
  offers: [],
  trendingOffers: [],
  popularBrands: [],
  categories: [],
  loading: false,
  error: null,
  searchQuery: '',
  filterCategory: null,
  sortBy: 'recent',
};

const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {
    setOffers: (state, action: PayloadAction<Offer[]>) => {
      state.offers = action.payload;
    },
    setTrendingOffers: (state, action: PayloadAction<Offer[]>) => {
      state.trendingOffers = action.payload;
    },
    setPopularBrands: (state, action: PayloadAction<OffersState['popularBrands']>) => {
      state.popularBrands = action.payload;
    },
    setCategories: (state, action: PayloadAction<OffersState['categories']>) => {
      state.categories = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilterCategory: (state, action: PayloadAction<string | null>) => {
      state.filterCategory = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'recent' | 'discount' | 'popular'>) => {
      state.sortBy = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateOffer: (state, action: PayloadAction<Offer>) => {
      const index = state.offers.findIndex(offer => offer.id === action.payload.id);
      if (index !== -1) {
        state.offers[index] = action.payload;
      }
      const trendingIndex = state.trendingOffers.findIndex(offer => offer.id === action.payload.id);
      if (trendingIndex !== -1) {
        state.trendingOffers[trendingIndex] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch all offers
    builder.addCase(fetchAllOffers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllOffers.fulfilled, (state, action) => {
      state.loading = false;
      state.offers = action.payload;
    });
    builder.addCase(fetchAllOffers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch trending offers
    builder.addCase(fetchTrendingOffers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTrendingOffers.fulfilled, (state, action) => {
      state.loading = false;
      // If no offers from API, use initial dummy data
      if (!action.payload || action.payload.length === 0) {
        state.trendingOffers = initialTrendingOffers;
      } else {
        state.trendingOffers = action.payload;
      }
    });
    builder.addCase(fetchTrendingOffers.rejected, (state, action) => {
      state.loading = false;
      // On error, fallback to dummy data
      state.trendingOffers = initialTrendingOffers;
      state.error = action.payload as string;
    });

    // Fetch categories
    builder.addCase(fetchCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch offers by category
    builder.addCase(fetchOffersByCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOffersByCategory.fulfilled, (state, action) => {
      state.loading = false;
      state.offers = action.payload;
    });
    builder.addCase(fetchOffersByCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch brands
    builder.addCase(fetchAllBrands.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllBrands.fulfilled, (state, action) => {
      state.loading = false;
      state.popularBrands = action.payload;
    });
    builder.addCase(fetchAllBrands.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setOffers,
  setTrendingOffers,
  setPopularBrands,
  setCategories,
  setSearchQuery,
  setFilterCategory,
  setSortBy,
  setLoading,
  setError,
  updateOffer,
} = offersSlice.actions;

export default offersSlice.reducer;
