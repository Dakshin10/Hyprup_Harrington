import { auth } from "@/lib/firebase";

/**
 * Base fetch wrapper that automatically attaches the Firebase Auth ID token.
 * All API calls should go through this function.
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const token = await currentUser.getIdToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed: ${response.status}`);
  }

  return data as T;
}
