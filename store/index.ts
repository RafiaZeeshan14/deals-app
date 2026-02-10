import { configureStore } from '@reduxjs/toolkit';
import offersReducer from './slices/offersSlice';
import favoritesReducer from './slices/favoritesSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    offers: offersReducer,
    favorites: favoritesReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
