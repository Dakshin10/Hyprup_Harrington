import { mockDb } from "@/lib/mockDb";
import { UserRole } from "@/types/user";

interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  createdAt?: number;
  available?: boolean;
  skills?: string[];
  name?: string;
  rating?: number;
  jobsCompleted?: number;
  reliability?: number;
  category?: string;
  location?: string;
  [key: string]: unknown;
}

// ─── Login / Upsert user ──────────────────────────────────────────────────────
export async function loginUser(
  uid: string,
  email: string | null,
  uiRole: UserRole
): Promise<{ role: UserRole }> {
  let profile = mockDb.getProfile(uid);
  if (!profile) {
    profile = { uid, email, role: uiRole, createdAt: Date.now() };
    mockDb.updateProfile(uid, profile);
  }
  return { role: profile.role };
}

// ─── Get user profile ─────────────────────────────────────────────────────────
export async function getUserProfile(
  uid: string,
  options: { includeBusinessProfile?: boolean } = {}
): Promise<UserProfile | null> {
  const profile = mockDb.getProfile(uid);
  return profile || null;
}

// ─── Update user profile ──────────────────────────────────────────────────────
export async function updateProfile(
  uid: string,
  updates: { name?: string; available?: boolean; skills?: string[] }
): Promise<UserProfile> {
  mockDb.updateProfile(uid, updates);
  const profile = mockDb.getProfile(uid);
  return profile;
}

// ─── Update business profile ──────────────────────────────────────────────────
export async function updateBusinessProfile(
  uid: string,
  profile: { name?: string; category?: string; location?: string }
): Promise<unknown> {
  mockDb.updateProfile(uid, profile);
  return profile;
}

// ─── Get business stats ───────────────────────────────────────────────────────
export async function getStats(
  uid: string
): Promise<{ jobs: number; completed: number; repeat: number }> {
  const jobs = mockDb.getJobs().filter(j => j.createdBy === uid);
  const completed = jobs.filter(j => j.status === "completed").length;
  return {
    jobs: jobs.length,
    completed: completed,
    repeat: 0 // Mocked
  };
}
