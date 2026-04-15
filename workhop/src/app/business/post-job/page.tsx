"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { createJob } from "@/services/jobService";
import { getTemplates } from "@/services/templateService";

/* ───────────── TYPES ───────────── */
interface JobForm {
  title: string;
  description: string;
  payment: number;
  duration: number;
  location: string;
  isUrgent: boolean;
  jobType: "instant" | "scheduled";
  slots: number;
}

/* ───────────── CONSTANTS ───────────── */
const HOURLY_RATE = 150;

/* ───────────── COMPONENT ───────────── */
export default function PostJobPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();

  const [form, setForm] = useState<JobForm>({
    title: "",
    description: "",
    payment: HOURLY_RATE,
    duration: 1,
    location: "",
    isUrgent: false,
    jobType: "instant",
    slots: 1,
  });

  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveTemplate, setSaveTemplate] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ───────────── AUTO PAYMENT ───────────── */
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      payment: Math.round(prev.duration * HOURLY_RATE),
    }));
  }, [form.duration]);

  /* ───────────── FETCH TEMPLATES ───────────── */
  useEffect(() => {
    if (!user) return;
    getTemplates()
      .then(setTemplates)
      .catch((err) => console.error("[PostJob] templates fetch:", err));
  }, [user]);

  const update = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ───────────── SUBMIT ───────────── */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.location) {
      return setError("Title and location required");
    }

    try {
      setLoading(true);
      setError("");

      await createJob({ ...form, saveTemplate });

      setSuccess("🚀 Job posted!");
      setTimeout(() => router.push("/business/dashboard"), 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (!user || role !== "business") {
    router.push("/login");
    return null;
  }

  return (
    <>
      <div className="min-h-screen p-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6"
        >

          {/* ───────── TEMPLATE PANEL ───────── */}
          <div className="bg-bg-card rounded-2xl border border-white/10 p-5 shadow-lg">
            <h2 className="font-semibold mb-4 text-text-primary">Templates</h2>

            {templates.length === 0 ? (
              <p className="text-sm text-text-muted">No templates yet</p>
            ) : (
              templates.map((t) => (
                <div
                  key={t.id || t._id}
                  onClick={() => setForm({ ...t })}
                  className="p-4 border border-white/10 rounded-xl mb-2 cursor-pointer bg-bg-main shadow hover:border-primary-500/30 hover:-translate-y-0.5 transition"
                >
                  <p className="font-semibold text-text-primary">{t.title}</p>
                  <p className="text-xs text-text-muted">
                    ₹{t.payment} • {t.duration} hr
                  </p>
                </div>
              ))
            )}
          </div>

          {/* ───────── MAIN FORM ───────── */}
          <div className="lg:col-span-2 bg-bg-card rounded-2xl border border-white/10 p-7 shadow-lg">

            {/* HEADER */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text-primary">
                Post a Job
              </h1>
              <p className="text-sm text-text-muted">
                Get workers in minutes
              </p>
            </div>

            {/* ALERTS */}
            <AnimatePresence>
              {error && (
                <motion.div className="mb-4 text-error-text bg-error-bg/20 p-3 rounded-lg text-sm font-semibold">
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div className="mb-4 text-success-text bg-success-bg/20 p-3 rounded-lg text-sm font-semibold">
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* BASIC */}
              <div className="space-y-4 border-b border-white/10 pb-5">
                <h3 className="text-sm font-semibold text-text-secondary">
                  Basic Info
                </h3>

                <input
                  placeholder="Job Title"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  className="w-full p-3 rounded-xl border border-white/10 bg-bg-main text-text-primary placeholder-text-muted focus:border-primary-500 focus:ring focus:ring-primary-500/30 outline-none transition"
                />

                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  className="w-full p-3 rounded-xl border border-white/10 bg-bg-main text-text-primary placeholder-text-muted focus:border-primary-500 focus:ring focus:ring-primary-500/30 outline-none transition"
                />
              </div>

              {/* DETAILS */}
              <div className="space-y-4 border-b border-white/10 pb-5">
                <h3 className="text-sm font-semibold text-text-secondary">
                  Job Details
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={form.payment}
                    onChange={(e) => update("payment", e.target.value)}
                    className="w-full p-3 rounded-xl border border-white/10 bg-bg-main text-text-primary placeholder-text-muted focus:border-primary-500 focus:ring focus:ring-primary-500/30 outline-none transition"
                  />

                  <select
                    value={form.duration}
                    onChange={(e) => update("duration", Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-white/10 bg-bg-main text-text-primary focus:border-primary-500 focus:ring focus:ring-primary-500/30 outline-none transition"
                  >
                    <option value={1}>1 hr</option>
                    <option value={2}>2 hr</option>
                    <option value={3}>3 hr</option>
                  </select>
                </div>

                <input
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  className="w-full p-3 rounded-xl border border-white/10 bg-bg-main text-text-primary placeholder-text-muted focus:border-primary-500 focus:ring focus:ring-primary-500/30 outline-none transition"
                />
              </div>

              {/* OPTIONS */}
              <div className="flex gap-6 text-sm text-text-secondary">
                <label>
                  <input
                    type="checkbox"
                    checked={form.isUrgent}
                    onChange={(e) => update("isUrgent", e.target.checked)}
                  />
                  {" "}Urgent
                </label>

                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => setSaveTemplate(e.target.checked)}
                  />
                  {" "}Save Template
                </label>
              </div>

              {/* CTA */}
              <button
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition disabled:opacity-50"
              >
                {loading ? "Posting..." : "Post Job"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
}