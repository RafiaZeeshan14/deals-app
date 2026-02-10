import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService, User } from '../../services/user.service';

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  token: null,
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  loading: false,
  error: null,
};

const USER_STORAGE_KEY = '@deals_app:user';
const TOKEN_STORAGE_KEY = '@deals_app:token';
const ONBOARDING_STORAGE_KEY = '@deals_app:onboarding_completed';

// Async Thunks
// ... loginUser and signupUser remain same ...
// [OMITTING loginUser and signupUser for brevity in replace_file_content, will use multi_replace if needed but targeting specifically what changes]
export const loginUser = createAsyncThunk(
  'user/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await userService.login(email, password);
      if (response.isSuccess && response.data) {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user));
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const signupUser = createAsyncThunk(
  'user/signup',
  async (userData: { firstName: string; lastName: string; email: string; password: string; phoneNumber: number; gender: number }, { rejectWithValue }) => {
    try {
      const response = await userService.signup(userData);
      if (response.isSuccess && response.data) {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user));
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Signup failed');
    }
  }
);

export const checkAuth = createAsyncThunk(
  'user/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      const userStr = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);

      const result: any = {
        hasCompletedOnboarding: onboardingCompleted === 'true'
      };

      if (token && userStr) {
        result.token = token;
        result.user = JSON.parse(userStr);
      }
      return result;
    } catch (error) {
      return rejectWithValue('Failed to restore session');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (token: string | null, { }) => {
    if (token) {
      await userService.logout(token);
    }
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    return;
  }
);


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    completeOnboarding: (state) => {
      state.hasCompletedOnboarding = true;
      AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    },
    updatePreferences: (state, action: PayloadAction<any>) => {
      // This was used in OnboardingScreen but not implemented in slice
      console.log('Preferences updated:', action.payload);
    }
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Signup
    builder.addCase(signupUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signupUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(signupUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Check Auth
    builder.addCase(checkAuth.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(checkAuth.fulfilled, (state, action: PayloadAction<{ user?: User; token?: string; hasCompletedOnboarding: boolean }>) => {
      state.loading = false;
      state.hasCompletedOnboarding = action.payload.hasCompletedOnboarding;
      if (action.payload.token && action.payload.user) {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      } else {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      }
    });
    builder.addCase(checkAuth.rejected, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    });
  },
});

export const { clearError, completeOnboarding, updatePreferences } = userSlice.actions;

export default userSlice.reducer;
