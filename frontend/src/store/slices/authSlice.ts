import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";
import { AuthState, User, AuthResponse } from "../../types";
import { authAPI } from "../../utils/api";

// Helper function for role-based redirect
export const getRedirectPath = (user: User | null): string => {
  if (!user) return "/";

  switch (user.role) {
    case "ADMIN":
      return "/admin";
    case "USER":
    default:
      return "/";
  }
};

// Async thunks
export const loginUser = createAsyncThunk<
  AuthResponse,
  { email: string; password: string }
>(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authAPI.login(email, password);
      // Extract the AuthResponse from the API response
      if ("data" in response && response.data) {
        return response.data;
      }
      return response as AuthResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk<
  AuthResponse,
  { email: string; password: string; name: string }
>(
  "auth/register",
  async (
    {
      email,
      password,
      name,
    }: { email: string; password: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authAPI.register(email, password, name);
      // Extract the AuthResponse from the API response
      if ("data" in response && response.data) {
        return response.data;
      }
      return response as AuthResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Registration failed"
      );
    }
  }
);

export const refreshToken = createAsyncThunk<AuthResponse, void>(
  "auth/refresh",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;

      if (!refreshToken) {
        throw new Error("No refresh token");
      }

      const response = await authAPI.refreshToken(refreshToken);
      // Extract the AuthResponse from the API response
      if ("data" in response && response.data) {
        return response.data;
      }
      return response as AuthResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Token refresh failed"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;

      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      // Ignore logout errors, still clear local state
      console.error("Logout error:", error);
    }

    // Clear persisted data
    if (typeof window !== "undefined") {
      localStorage.removeItem("persist:auth");
      localStorage.removeItem("persist:ui");
      localStorage.removeItem("persist:root");
    }
  }
);

export const getProfile = createAsyncThunk(
  "auth/profile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to get profile"
      );
    }
  }
);

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log("✅ Login successful");

        state.isLoading = false;
        const authResponse = action.payload;
        if (authResponse) {
          state.user = authResponse.user;
          state.accessToken = authResponse.accessToken;
          state.refreshToken = authResponse.refreshToken;
          state.isAuthenticated = true;
          
          console.log("📝 Auth state updated:", {
            hasUser: !!state.user,
            userEmail: state.user?.email,
            isAuthenticated: state.isAuthenticated
          });
        }
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const authResponse = action.payload;
        if (authResponse) {
          state.user = authResponse.user;
          state.accessToken = authResponse.accessToken;
          state.refreshToken = authResponse.refreshToken;
          state.isAuthenticated = true;
        }
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Refresh token
      .addCase(refreshToken.pending, (state) => {
        console.log("Refresh token pending...");
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        console.log("🔄 Token refresh successful");
        const authResponse = action.payload;
        if (authResponse) {
          state.accessToken = authResponse.accessToken;
          state.refreshToken = authResponse.refreshToken;
          if (authResponse.user) {
            state.user = authResponse.user;
          }
          state.isAuthenticated = true;
        }
      })
      .addCase(refreshToken.rejected, (state, action) => {
        console.log("Refresh token rejected:", action.payload);
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      // Get profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(getProfile.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })

      // Handle rehydration from persisted state
      .addMatcher(
        (action) => action.type === REHYDRATE,
        (state, action: any) => {
          console.log("🔄 REHYDRATE action received");
          
          // Check localStorage keys
          if (typeof window !== "undefined") {
            const persistKeys = Object.keys(localStorage).filter(k => k.startsWith('persist'));
            console.log("🗄️ Available persist keys:", persistKeys);
          }
          
          // With root persist, auth data will be in action.payload.auth
          let persistedAuth = null;
          
          // Try both locations for auth data
          if (action.payload?.auth) {
            persistedAuth = action.payload.auth;
            console.log("📍 Found auth data in payload.auth");
          } else if (action.payload && typeof action.payload === 'object') {
            // Sometimes the auth data might be directly in payload
            if (action.payload.user || action.payload.accessToken) {
              persistedAuth = action.payload;
              console.log("📍 Found auth data directly in payload");
            }
          }
          
          if (persistedAuth) {
            console.log("📦 Persisted auth found:", {
              hasUser: !!persistedAuth.user,
              hasTokens: !!(persistedAuth.accessToken && persistedAuth.refreshToken),
              isAuthenticated: persistedAuth.isAuthenticated
            });
            
            // Validate that we have the required tokens
            if (persistedAuth.accessToken && persistedAuth.refreshToken) {
              console.log("✅ Valid tokens found, restoring auth state");
              return {
                ...state,
                ...persistedAuth,
                isLoading: false,
                error: null,
              };
            }
          }
          // If no valid persisted auth, maintain clean initial state
          console.log("❌ No valid persisted auth, using initial state");
          return {
            ...initialState,
            isLoading: false,
          };
        }
      );
  },
});

export const { clearError, updateUser, setTokens, clearAuth } =
  authSlice.actions;
export default authSlice.reducer;
