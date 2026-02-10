import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { favoritesService } from '../../services/favorites.service';
import { Offer } from './offersSlice';

interface FavoritesState {
  favorites: Offer[];
  loading: boolean;
}

const initialState: FavoritesState = {
  favorites: [],
  loading: false,
};

const FAVORITES_STORAGE_KEY = '@deals_app:favorites';

// Async Thunks
export const loadFavoritesFromBackend = createAsyncThunk(
  'favorites/load',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('@deals_app:token');
      if (!token) return []; // Don't call API if no token

      const favorites = await favoritesService.getFavorites();
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      return favorites;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleFavoriteOnBackend = createAsyncThunk(
  'favorites/toggle',
  async (offer: Offer, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await favoritesService.toggleFavorite(offer.id);
      if (response.isSuccess) {
        // Reload favorites to ensure consistency with backend
        dispatch(loadFavoritesFromBackend());
        return { offer, success: true };
      }
      return rejectWithValue('Failed to toggle favorite');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Fallback to local storage if needed
export const loadFavoritesFromStorage = createAsyncThunk(
  'favorites/loadFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadFavoritesFromBackend.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loadFavoritesFromBackend.fulfilled, (state, action: PayloadAction<Offer[]>) => {
      state.favorites = action.payload;
      state.loading = false;
    });
    builder.addCase(loadFavoritesFromBackend.rejected, (state) => {
      state.loading = false;
    });

    builder.addCase(loadFavoritesFromStorage.fulfilled, (state, action: PayloadAction<Offer[]>) => {
      if (state.favorites.length === 0) {
        state.favorites = action.payload;
      }
    });

    builder.addCase(toggleFavoriteOnBackend.pending, (state, action) => {
      // Optimistic update: immediately toggle the favorite in UI
      const offer = action.meta.arg;
      const existingIndex = state.favorites.findIndex(fav => fav.id === offer.id);

      if (existingIndex >= 0) {
        // Remove from favorites
        state.favorites.splice(existingIndex, 1);
      } else {
        // Add to favorites
        state.favorites.push(offer);
      }
    });

    builder.addCase(toggleFavoriteOnBackend.fulfilled, (state, action) => {
      // Backend confirmed - the loadFavoritesFromBackend will sync the state
    });

    builder.addCase(toggleFavoriteOnBackend.rejected, (state, action) => {
      // Rollback optimistic update on error
      const offer = action.meta.arg;
      const existingIndex = state.favorites.findIndex(fav => fav.id === offer.id);

      if (existingIndex >= 0) {
        // Was added optimistically, remove it
        state.favorites.splice(existingIndex, 1);
      } else {
        // Was removed optimistically, add it back
        state.favorites.push(offer);
      }
    });
  },
});

export default favoritesSlice.reducer;
