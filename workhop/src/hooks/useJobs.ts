import { useCallback, useEffect, useState } from "react";
import { getJobs } from "@/services/jobService";
import { Job } from "@/types/job";
import { useStore } from "@/store/useStore";

interface UseJobsOptions {
  createdBy?: string;
  status?: string;
  applicantsContain?: string;
  maxResults?: number;
  /** Skip fetching entirely (e.g. while auth is loading) */
  skip?: boolean;
}

export const useJobs = (options: UseJobsOptions = {}) => {
  const { createdBy, status, applicantsContain, maxResults = 20, skip = false } = options;

  const { jobs, setJobs, isJobsCacheStale } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(
    async (force = false) => {
      if (skip) return;

      // Use cache if still fresh and not forcing
      if (!force && !isJobsCacheStale() && jobs.length > 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fetched = await getJobs({
          createdBy,
          status,
          applicant: applicantsContain,
          limit: maxResults,
        });

        fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setJobs(fetched);
      } catch (err) {
        console.error("[useJobs] fetch error:", err);
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [createdBy, status, applicantsContain, maxResults, skip]
  );

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, refetch: () => fetchJobs(true) };
};
