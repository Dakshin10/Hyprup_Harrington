import { apiFetch } from "./api";
import { UserRole } from "@/types/user";

interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  available?: boolean;
  skills?: string[];
  name?: string;
  rating?: number;
  jobsCompleted?: number;
  reliability?: number;
  // Business profile fields (merged)
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
  const data = await apiFetch<{ role: UserRole }>("/api/users/login", {
    method: "POST",
    body: JSON.stringify({ uid, email, uiRole }),
  });
  return data;
}

// ─── Get user profile ─────────────────────────────────────────────────────────
export async function getUserProfile(
  uid: string,
  options: { includeBusinessProfile?: boolean } = {}
): Promise<UserProfile> {
  const params = new URLSearchParams();
  if (options.includeBusinessProfile) params.set("includeBusinessProfile", "true");
  const data = await apiFetch<{ user: UserProfile }>(`/api/users/${uid}?${params}`);
  return data.user;
}

// ─── Update user profile ──────────────────────────────────────────────────────
export async function updateProfile(
  uid: string,
  updates: { name?: string; available?: boolean; skills?: string[] }
): Promise<UserProfile> {
  const data = await apiFetch<{ user: UserProfile }>(`/api/users/${uid}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return data.user;
}

// ─── Update business profile ──────────────────────────────────────────────────
export async function updateBusinessProfile(
  uid: string,
  profile: { name?: string; category?: string; location?: string }
): Promise<unknown> {
  const data = await apiFetch<{ profile: unknown }>(`/api/users/${uid}/business-profile`, {
    method: "PUT",
    body: JSON.stringify(profile),
  });
  return data.profile;
}

// ─── Get business stats ───────────────────────────────────────────────────────
export async function getStats(
  uid: string
): Promise<{ jobs: number; completed: number; repeat: number }> {
  const data = await apiFetch<{ stats: { jobs: number; completed: number; repeat: number } }>(
    `/api/users/${uid}/stats`
  );
  return data.stats;
}
