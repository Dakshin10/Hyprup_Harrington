export type UserRole = "student" | "business";

export interface UserProfile {
  uid: string;
  email: string | null;
  role: UserRole;
  name?: string;
  createdAt?: string | number | Date;
}

/**
 * Fetches user profile from MongoDB via API
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`/api/user?uid=${uid}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/**
 * Creates or updates user profile in MongoDB via API
 */
export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  try {
    const res = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, ...data }),
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update profile");
    }
    
    return await res.json();
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

/**
 * Helper to set auth cookie for middleware
 */
export function setAuthCookie(token: string | null) {
  if (typeof window === "undefined") return;
  
  if (token) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `auth-token=${token}; path=/; expires=${expires}; SameSite=Lax`;
  } else {
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  }
}
