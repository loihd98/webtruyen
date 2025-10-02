import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";

export const useAuthReady = () => {
  const [isReady, setIsReady] = useState(false);
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Wait a bit to ensure rehydration is complete
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return { isReady, ...auth };
};
