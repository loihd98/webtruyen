"use client";

import { Provider } from "react-redux";
import { useEffect } from "react";
import { store } from "../store";
import { setTokenHandlers } from "../utils/api";
import { clearAuth, refreshToken } from "../store/slices/authSlice";
import { LanguageProvider } from "../contexts/LanguageContext";

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
  }, []);

  return (
    <Provider store={store}>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </Provider>
  );
}
