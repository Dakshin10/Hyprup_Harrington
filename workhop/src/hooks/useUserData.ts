import { useCallback, useEffect, useState } from "react";
import { getUserProfile } from "@/services/userService";
import { useStore } from "@/store/useStore";

interface UseUserDataOptions {
  uid?: string | null;
  includeBusinessProfile?: boolean;
}

export const useUserData = ({ uid, includeBusinessProfile = false }: UseUserDataOptions) => {
  const { userData, setUserData, isUserDataCacheStale } = useStore();
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(
    async (force = false) => {
      if (!uid) {
        setLoading(false);
        return;
      }

      if (!force && !isUserDataCacheStale() && userData) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const profile = await getUserProfile(uid, { includeBusinessProfile });
        setUserData(profile as Record<string, unknown>);
      } catch (err) {
        console.error("[useUserData] fetch error:", err);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uid, includeBusinessProfile]
  );

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return { userData, loading, refetch: () => fetchUserData(true) };
};
