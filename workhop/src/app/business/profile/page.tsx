"use client";

import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function BusinessProfilePage() {
  const { user, role, loading } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    location: "",
  });

  const [stats, setStats] = useState({
    jobs: 0,
    completed: 0,
    repeat: 0,
  });

  // 🔥 FETCH PROFILE
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const ref = doc(db, "businessProfiles", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data() as any;
        setProfile(data);
        setForm({
          name: data.name || "",
          category: data.category || "",
          location: data.location || "",
        });
      }
    };

    fetchProfile();
  }, [user]);

  // 🔥 FETCH STATS
  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const q = query(
        collection(db, "jobs"),
        where("createdBy", "==", user.uid)
      );

      const snap = await getDocs(q);

      const jobs = snap.docs.map((d) => d.data());

      setStats({
        jobs: jobs.length,
        completed: jobs.filter((j) => j.status === "completed").length,
        repeat: jobs.filter((j) => j.repeatHire).length,
      });
    };

    fetchStats();
  }, [user]);

  // 🔥 SAVE PROFILE
  const saveProfile = async () => {
    if (!user) return;
    await setDoc(doc(db, "businessProfiles", user.uid), form);
    setProfile(form);
    setEditing(false);
  };

  if (loading) return null;

  if (!user || role !== "business") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link href="/login">Login</Link>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen p-6">

        <div className="max-w-5xl mx-auto space-y-6">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-text-primary">
              Business Profile
            </h1>

            {editing ? (
              <button
                onClick={saveProfile}
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2 rounded-xl shadow-lg transition"
              >
                Save
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
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full p-3 rounded-xl border border-white/10 bg-bg-main text-text-primary placeholder-text-muted focus:border-primary-500 focus:ring focus:ring-primary-500/30 outline-none transition"
                      placeholder="Business Name"
                    />
                    <input
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="w-full p-3 rounded-xl border border-white/10 bg-bg-main text-text-primary placeholder-text-muted focus:border-primary-500 focus:ring focus:ring-primary-500/30 outline-none transition"
                      placeholder="Category"
                    />
                    <input
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      className="w-full p-3 rounded-xl border border-white/10 bg-bg-main text-text-primary placeholder-text-muted focus:border-primary-500 focus:ring focus:ring-primary-500/30 outline-none transition"
                      placeholder="Location"
                    />
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-text-primary">
                      {profile?.name || "Your Business"}
                    </h2>
                    <p className="text-text-muted font-medium">
                      {profile?.category || "Category"} •{" "}
                      {profile?.location || "Location"}
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
    </DashboardLayout>
  );
}

// 🔥 COMPONENTS
function Stat({ label, value }: any) {
  return (
    <div className="bg-bg-card p-4 rounded-2xl shadow-lg border border-white/10 text-center hover:border-primary-500/30 transition-colors">
      <p className="text-text-muted text-sm font-semibold tracking-wider uppercase">{label}</p>
      <h2 className="text-3xl font-extrabold text-text-primary mt-2">{value}</h2>
    </div>
  );
}

function Badge({ title }: any) {
  return (
    <div className="px-4 py-2 bg-primary-500/10 text-primary-500 border border-primary-500/20 rounded-xl text-sm font-bold shadow-sm">
      {title}
    </div>
  );
}