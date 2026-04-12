import { useCallback, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
        const userSnap = await getDoc(doc(db, "users", uid));
        let merged: Record<string, unknown> = {};

        if (userSnap.exists()) {
          merged = { ...userSnap.data() };
        }

        if (includeBusinessProfile) {
          const bizSnap = await getDoc(doc(db, "businessProfiles", uid));
          if (bizSnap.exists()) {
            merged = { ...merged, ...bizSnap.data() };
          }
        }

        setUserData(merged);
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
