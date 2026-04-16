"use client";

import { useEffect } from "react";
import { mockDb } from "@/lib/mockDb";

export const DataInitializer = () => {
  useEffect(() => {
    // Force initialization of localStorage data if it doesn't exist
    mockDb.init();
    
    // Debug log to confirm data exists (optional)
    console.log("[DataInitializer] localStorage synced");
  }, []);

  return null; // Side-effect only component
};
