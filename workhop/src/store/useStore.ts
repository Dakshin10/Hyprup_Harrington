import { create } from "zustand";
import { Job } from "@/types/job";

const STALE_TIME = 30_000; // 30 seconds

interface UserData {
  email?: string;
  name?: string;
  role?: string;
  available?: boolean;
  skills?: string[];
  rating?: number;
  jobsCompleted?: number;
  reliability?: number;
  [key: string]: unknown;
}

interface AppStore {
  // ─── Jobs cache ───────────────────────────────────────────
  jobs: Job[];
  jobsLastFetched: number | null;
  setJobs: (jobs: Job[]) => void;
  isJobsCacheStale: () => boolean;
  clearJobs: () => void;

  // ─── User data cache ──────────────────────────────────────
  userData: UserData | null;
  userDataLastFetched: number | null;
  setUserData: (data: UserData) => void;
  isUserDataCacheStale: () => boolean;
  clearUserData: () => void;
}

export const useStore = create<AppStore>((set, get) => ({
  // ─── Jobs ─────────────────────────────────────────────────
  jobs: [],
  jobsLastFetched: null,
  setJobs: (jobs) => set({ jobs, jobsLastFetched: Date.now() }),
  isJobsCacheStale: () => {
    const { jobsLastFetched } = get();
    if (!jobsLastFetched) return true;
    return Date.now() - jobsLastFetched > STALE_TIME;
  },
  clearJobs: () => set({ jobs: [], jobsLastFetched: null }),

  // ─── User data ────────────────────────────────────────────
  userData: null,
  userDataLastFetched: null,
  setUserData: (data) => set({ userData: data, userDataLastFetched: Date.now() }),
  isUserDataCacheStale: () => {
    const { userDataLastFetched } = get();
    if (!userDataLastFetched) return true;
    return Date.now() - userDataLastFetched > STALE_TIME;
  },
  clearUserData: () => set({ userData: null, userDataLastFetched: null }),
}));
