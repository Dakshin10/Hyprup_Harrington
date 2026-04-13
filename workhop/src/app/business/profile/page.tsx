"use client";

import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { useToast } from "@/hooks/useToast";
import { doc, setDoc, getDocs, query, collection, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState, useEffect, useMemo, memo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PageWrapper } from "@/components/MotionWrappers";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { ToastContainer } from "@/components/ui/Toast";

// ─── STAT CARD ───────────────────────────────────────────────────────────────
const Stat = memo(function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-bg-card p-4 rounded-2xl shadow-lg border border-white/10 text-center hover:border-primary-500/30 transition-colors">
      <p className="text-text-muted text-sm font-semibold tracking-wider uppercase">{label}</p>
      <h2 className="text-3xl font-extrabold text-text-primary mt-2">{value}</h2>
    </div>
  );
});

// ─── TRUST BADGE ─────────────────────────────────────────────────────────────
const Badge = memo(function Badge({ title }: { title: string }) {
  return (
    <div className="px-4 py-2 bg-primary-500/10 text-primary-500 border border-primary-500/20 rounded-xl text-sm font-bold shadow-sm">
      {title}
    </div>
  );
});

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function BusinessProfilePage() {
  const { user, role, loading: authLoading } = useAuth();
  const { userData, loading: userDataLoading } = useUserData({
    uid: user?.uid,
    includeBusinessProfile: true,
  });
  const { toasts, toast, dismiss } = useToast();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", location: "" });
  const [saving, setSaving] = useState(false);

  const [stats, setStats] = useState({ jobs: 0, completed: 0, repeat: 0 });

  // Sync form when userData loads
  useEffect(() => {
    if (userData) {
      setForm({
        name: (userData.name as string) || "",
        category: (userData.category as string) || "",
        location: (userData.location as string) || "",
      });
    }
  }, [userData]);

  // Fetch stats once (getDocs)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchStats = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "jobs"), where("createdBy", "==", user.uid))
        );
        if (cancelled) return;
        const jobsList = snap.docs.map((d) => d.data());
        setStats({
          jobs: jobsList.length,
          completed: jobsList.filter((j) => j.status === "completed").length,
          repeat: jobsList.filter((j) => j.repeatHire).length,
        });
      } catch (err) {
        console.error("[BusinessProfile] stats error:", err);
      }
    };

    fetchStats();
    return () => { cancelled = true; };
  }, [user]);

  // ─── Save profile ─────────────────────────────────────────────────────────
  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "businessProfiles", user.uid), form, { merge: true });
      toast("Profile saved!", "success");
      setEditing(false);
    } catch {
      toast("Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const loading = authLoading || userDataLoading;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-10 w-48 bg-white/5 rounded-lg animate-pulse" />
        <LoadingSkeleton />
      </div>
    );
  }

  if (!user || role !== "business") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-error-bg/20 text-error-text rounded-full flex items-center justify-center mx-auto text-2xl font-bold">!</div>
          <h2 className="text-xl font-bold text-text-primary">Unauthorized Access</h2>
          <p className="text-text-muted text-sm">You must be logged in as a business to view this profile.</p>
          <Link href="/login" className="block w-full py-2.5 rounded-xl bg-bg-card border border-white/10 text-text-primary hover:border-primary-500 transition font-semibold">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismiss} />
      <PageWrapper>
        <div className="min-h-screen p-6">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-text-primary">Business Profile</h1>
              {editing ? (
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2 rounded-xl shadow-lg transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="border border-white/10 text-text-secondary hover:text-text-primary font-semibold px-5 py-2 rounded-xl transition"
                >
                  Edit
                </button>
              )}
            </div>

            {/* PROFILE CARD */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-card rounded-2xl p-6 shadow-lg border border-white/10"
            >
              <div className="flex gap-4 items-center">
                <div className="text-4xl">🏪</div>
                <div className="flex-1 space-y-2">
                  {editing ? (
                    <>
                      <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full p-3 rounded-xl border border-white/10 bg-bg-main text-text-primary placeholder-text-muted focus:border-primary-500 focus:ring focus:ring-primary-500/30 outline-none transition"
                        placeholder="Business Name"
                      />
                      <input
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full p-3 rounded-xl border border-white/10 bg-bg-main text-text-primary placeholder-text-muted focus:border-primary-500 focus:ring focus:ring-primary-500/30 outline-none transition"
                        placeholder="Category"
                      />
                      <input
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        className="w-full p-3 rounded-xl border border-white/10 bg-bg-main text-text-primary placeholder-text-muted focus:border-primary-500 focus:ring focus:ring-primary-500/30 outline-none transition"
                        placeholder="Location"
                      />
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-text-primary">
                        {(userData?.name as string) || "Your Business"}
                      </h2>
                      <p className="text-text-muted font-medium">
                        {(userData?.category as string) || "Category"} •{" "}
                        {(userData?.location as string) || "Location"}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4">
              <Stat label="Jobs Posted" value={stats.jobs} />
              <Stat label="Completed" value={stats.completed} />
              <Stat label="Repeat Hires" value={stats.repeat} />
            </div>

            {/* TRUST BADGES */}
            <div className="bg-bg-card p-6 rounded-2xl shadow-lg border border-white/10">
              <h3 className="font-bold mb-4 text-text-primary">Trust Badges</h3>
              <div className="flex gap-4">
                <Badge title="Fast Payer" />
                <Badge title="Reliable" />
              </div>
            </div>

          </div>
        </div>
      </PageWrapper>
    </>
  );
}