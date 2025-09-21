import { configureStore } from "@reduxjs/toolkit";

// Import slices
import authSlice from "./slices/authSlice";
import uiSlice from "./slices/uiSlice";
import bookmarkSlice from "./slices/bookmarkSlice";
import unlockSlice from "./slices/unlockSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    bookmarks: bookmarkSlice,
    unlock: unlockSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
