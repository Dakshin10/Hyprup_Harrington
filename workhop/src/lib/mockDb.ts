"use client";

import { Job } from "@/types/job";
import { UserRole } from "@/types/user";

// ─── KEYS ────────────────────────────────────────────────────────────────────
const KEYS = {
  JOBS: "workhop_jobs",
  APPLICATIONS: "workhop_apps",
  USER: "workhop_user",
  PROFILES: "workhop_profiles",
  TEMPLATES: "workhop_templates",
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: "pending" | "selected" | "rejected" | "completed";
  appliedAt: number;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const get = <T>(key: string): T[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const set = <T>(key: string, data: T[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const INITIAL_JOBS: Job[] = [
  {
    jobId: "seed-1",
    title: "Shop Helper",
    description: "Help with stock arrangement and cleaning during busy hours.",
    payment: 300,
    duration: 2,
    location: { type: "Point", coordinates: [76.9558, 11.0168] },
    address: "Town Hall Shop, Coimbatore",
    status: "open",
    createdBy: "business-1",
    applicants: [],
    assignedUsers: [],
    peopleRequired: 1,
    createdAt: Date.now() - 3600000,
  },
  {
    jobId: "seed-2",
    title: "Event Setup",
    description: "Setting up chairs and equipment for a local festival.",
    payment: 500,
    duration: 3,
    location: { type: "Point", coordinates: [76.9658, 11.0268] },
    address: "Gandhipuram Ground, Coimbatore",
    status: "open",
    createdBy: "business-2",
    applicants: [],
    assignedUsers: [],
    peopleRequired: 1,
    createdAt: Date.now() - 7200000,
    isUrgent: true,
  }
];

// ─── API ──────────────────────────────────────────────────────────────────────
export const mockDb = {
  // JOBS
  getJobs: () => get<Job>(KEYS.JOBS),
  saveJobs: (jobs: Job[]) => set(KEYS.JOBS, jobs),
  addJob: (job: Job) => {
    const jobs = mockDb.getJobs();
    mockDb.saveJobs([job, ...jobs]);
  },
  updateJob: (jobId: string, updates: Partial<Job>) => {
    const jobs = mockDb.getJobs();
    const updated = jobs.map(j => j.jobId === jobId ? { ...j, ...updates } : j);
    mockDb.saveJobs(updated);
    return updated.find(j => j.jobId === jobId);
  },

  // APPLICATIONS
  getApps: () => get<Application>(KEYS.APPLICATIONS),
  saveApps: (apps: Application[]) => set(KEYS.APPLICATIONS, apps),
  addApp: (app: Application) => {
    const apps = mockDb.getApps();
    mockDb.saveApps([app, ...apps]);
    // Also update job applicants list
    const job = mockDb.getJobs().find(j => j.jobId === app.jobId);
    if (job && !job.applicants.includes(app.userId)) {
      mockDb.updateJob(app.jobId, { applicants: [...job.applicants, app.userId] });
    }
  },

  // USER / AUTH
  getUser: () => {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: any) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  // PROFILES
  getProfiles: () => get<any>(KEYS.PROFILES),
  saveProfiles: (profiles: any[]) => set(KEYS.PROFILES, profiles),
  getProfile: (uid: string) => mockDb.getProfiles().find(p => p.uid === uid),
  updateProfile: (uid: string, updates: any) => {
    const profiles = mockDb.getProfiles();
    const index = profiles.findIndex(p => p.uid === uid);
    if (index > -1) {
      profiles[index] = { ...profiles[index], ...updates };
    } else {
      profiles.push({ uid, ...updates });
    }
    mockDb.saveProfiles(profiles);
  },

  // INITIALIZE
  init: () => {
    if (typeof window === "undefined") return;
    
    // Check and seed Jobs
    const currentJobs = mockDb.getJobs();
    if (!currentJobs || currentJobs.length === 0) {
      console.log("[mockDb] Seeding initial jobs...");
      mockDb.saveJobs(INITIAL_JOBS);
    }
    
    // Check and seed default User
    const currentUser = mockDb.getUser();
    if (!currentUser) {
      console.log("[mockDb] Seeding default demo user...");
      const defaultUser = { uid: "demo-user", email: "demo@workhop.com", role: "student" };
      mockDb.setUser(defaultUser);
      mockDb.updateProfile("demo-user", { 
        uid: "demo-user", 
        email: "demo@workhop.com", 
        role: "student",
        name: "Demo Student",
        rating: 4.8,
        jobsCompleted: 12,
        reliability: 98
      });
    }
  }
};
