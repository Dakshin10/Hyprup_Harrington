import { useState, useEffect } from "react";
import { onIdTokenChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserProfile, setAuthCookie, UserRole } from "../lib/auth-utils";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          // Sync token to cookie for Middleware
          const token = await firebaseUser.getIdToken();
          setAuthCookie(token);
          
          // Get role from MongoDB API
          const profile = await getUserProfile(firebaseUser.uid);
          setUser(firebaseUser);
          setRole(profile?.role || null);
        } else {
          // Clear everything
          setAuthCookie(null);
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    // Redirect logic handled in Login page
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setAuthCookie(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return { user, role, loading, login, logout };
};
