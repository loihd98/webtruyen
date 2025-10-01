import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";

// Import slices
import authSlice from "./slices/authSlice";
import uiSlice from "./slices/uiSlice";
import bookmarkSlice from "./slices/bookmarkSlice";
import unlockSlice from "./slices/unlockSlice";

// Persist config for auth slice
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "accessToken", "refreshToken", "isAuthenticated"], // Only persist these fields
};

// Persist config for UI slice (only theme)
const uiPersistConfig = {
  key: "ui",
  storage,
  whitelist: ["theme"], // Only persist theme
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authSlice);
const persistedUiReducer = persistReducer(uiPersistConfig, uiSlice);

// Combine all reducers
const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  ui: persistedUiReducer,
  bookmarks: bookmarkSlice,
  unlock: unlockSlice,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/REGISTER",
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
