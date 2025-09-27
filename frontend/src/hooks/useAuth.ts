import { useSelector } from "react-redux";
import { RootState } from "../store";

/**
 * Custom hook to get auth headers for API calls
 * Uses Redux state instead of localStorage
 */
export const useAuthHeaders = () => {
  const { accessToken } = useSelector((state: RootState) => state.auth);

  return {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    hasToken: !!accessToken,
  };
};

/**
 * Custom hook to get just the access token
 */
export const useAccessToken = () => {
  const { accessToken } = useSelector((state: RootState) => state.auth);
  return accessToken;
};
