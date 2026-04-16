import { useState, useEffect } from "react";
import { mockDb } from "../lib/mockDb";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<"student" | "business" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize DB on first load
    mockDb.init();

    const currentUser = mockDb.getUser();
    if (currentUser) {
      setUser(currentUser);
      setRole(currentUser.role);
    } else {
      setUser(null);
      setRole(null);
    }
    setLoading(false);
  }, []);

  const login = (userData: any) => {
    mockDb.setUser(userData);
    setUser(userData);
    setRole(userData.role);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setRole(null);
  };

  return { user, role, loading, login, logout };
};
