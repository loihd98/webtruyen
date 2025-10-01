"use client";

import { Provider } from "react-redux";
import { useEffect } from "react";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "react-hot-toast";
import { store, persistor } from "../store";
import { setTokenHandlers } from "../utils/api";
import { clearAuth, refreshToken } from "../store/slices/authSlice";
import { getBookmarks } from "../store/slices/bookmarkSlice";
import { LanguageProvider } from "@/contexts/LanguageContext";

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Set up token handlers for API client
    setTokenHandlers(
      // getAuthToken
      () => {
        const state = store.getState();
        return state.auth.accessToken;
      },
      // handleTokenRefresh
      async () => {
        try {
          const result = await store.dispatch(refreshToken());
          if (refreshToken.fulfilled.match(result)) {
            const state = store.getState();
            return state.auth.accessToken;
          }
          return null;
        } catch (error) {
          return null;
        }
      },
      // handleLogout
      () => {
        store.dispatch(clearAuth());
      }
    );

    // Validate tokens on app startup
    const validatePersistedTokens = () => {
      const state = store.getState();
      if (state.auth.isAuthenticated && state.auth.refreshToken) {
        // Try to refresh the token to validate it's still valid
        store
          .dispatch(refreshToken())
          .then((result) => {
            if (refreshToken.fulfilled.match(result)) {
              // If refresh successful, load user's bookmarks
              store.dispatch(getBookmarks());
            }
          })
          .catch(() => {
            // If refresh fails, clear the auth state
            store.dispatch(clearAuth());
          });
      }
    };

    // Wait a bit for persist gate to rehydrate, then validate
    setTimeout(validatePersistedTokens, 100);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }
        persistor={persistor}
      >
        <LanguageProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
                borderRadius: "8px",
                fontSize: "14px",
                maxWidth: "400px",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#4aed88",
                  secondary: "#fff",
                },
                style: {
                  background: "#10b981",
                  color: "#fff",
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
                style: {
                  background: "#ef4444",
                  color: "#fff",
                },
              },
            }}
          />
        </LanguageProvider>
      </PersistGate>
    </Provider>
  );
}
