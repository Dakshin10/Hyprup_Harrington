"use client";

import { useMemo } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import { PageWrapper, MotionCard } from "@/components/MotionWrappers";
import { ToastContainer } from "@/components/ui/Toast";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { getDocs, query, collection, where, limit } from "firebase/firestore";
import { Job } from "@/types/job";
import { useEffect } from "react";

export default function StudentProfile() {
  const { user, role } = useAuth();
  const { userData, loading: userLoading } = useUserData({ uid: user?.uid });
  const { toasts, toast, dismiss } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // ─── Fetch job history once (getDocs, not onSnapshot) ────────────────────
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchJobs = async () => {
      setJobsLoading(true);
      try {
        const snap = await getDocs(
          query(
            collection(db, "jobs"),
            where("applicants", "array-contains", user.uid),
            limit(20)
          )
        );
        if (cancelled) return;
        const fetched: Job[] = snap.docs.map((d) => ({
          jobId: d.id,
          ...(d.data() as Omit<Job, "jobId">),
        }));
        setJobs(fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      } catch (err) {
        console.error("[StudentProfile] fetch error:", err);
        toast("Failed to load job history", "error");
      } finally {
        if (!cancelled) setJobsLoading(false);
      }
    };

    fetchJobs();
    return () => { cancelled = true; };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Derived stats (memoized) ────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!user) return { completedJobs: [], totalEarnings: 0, reliability: 0, progress: 0 };

    const completedJobs = jobs.filter((j) => j.selectedUser === user.uid && j.completed);
    const totalEarnings = completedJobs.reduce((sum, j) => sum + Number(j.payment || 0), 0);
    const reliability = jobs.length > 0 ? Math.round((completedJobs.length / jobs.length) * 100) : 0;
    const monthlyGoal = 5000;
    const progress = Math.min((totalEarnings / monthlyGoal) * 100, 100);

    return { completedJobs, totalEarnings, reliability, progress, monthlyGoal };
  }, [jobs, user]);

  // ─── Profile editing state ───────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const saveProfile = async (updatedSkills: string[]) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), { skills: updatedSkills }, { merge: true });
      toast("Profile saved!", "success");
      setEditing(false);
    } catch {
      toast("Failed to save profile", "error");
    }
  };

  const skills: string[] = userData?.skills as string[] || ["Customer Service", "Helper", "Stocking"];

  if (!user || role !== "student") return null;

  const loading = userLoading || jobsLoading;

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismiss} />
      <PageWrapper>

        {/* PROFILE HEADER */}
        <MotionCard className="p-6 rounded-2xl mb-6 flex items-center gap-4 bg-bg-card border border-white/10 shadow-lg">
          <div className="w-14 h-14 bg-gradient-to-tr from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              {userData?.name as string || user.email}
            </h1>
            <p className="text-sm text-text-muted">
              Student • {userData?.available ? "🟢 Available" : "⚪ Offline"}
            </p>
          </div>
        </MotionCard>

        {/* STATS */}
        {loading ? (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 bg-bg-card border border-white/10 rounded-2xl animate-pulse h-24" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <MotionCard className="p-4 bg-bg-card border border-white/10 rounded-2xl">
              <p className="text-sm text-text-muted">Earnings</p>
              <h2 className="text-xl font-bold text-primary-500">₹{stats.totalEarnings}</h2>
            </MotionCard>
            <MotionCard className="p-4 bg-bg-card border border-white/10 rounded-2xl">
              <p className="text-sm text-text-muted">Completed</p>
              <h2 className="text-xl font-bold text-success-text">{stats.completedJobs.length}</h2>
            </MotionCard>
            <MotionCard className="p-4 bg-bg-card border border-white/10 rounded-2xl">
              <p className="text-sm text-text-muted">Reliability</p>
              <h2 className="text-xl font-bold text-info-text">{stats.reliability}%</h2>
            </MotionCard>
            <MotionCard className="p-4 bg-bg-card border border-white/10 rounded-2xl">
              <p className="text-sm text-text-muted">Rating</p>
              <h2 className="text-xl font-bold text-warning-text">4.6 ⭐</h2>
            </MotionCard>
          </div>
        )}

        {/* GOAL PROGRESS */}
        <MotionCard className="p-6 mb-6 bg-bg-card border border-white/10 rounded-2xl">
          <h2 className="font-bold mb-2 text-text-primary">Monthly Goal</h2>
          <p className="text-sm mb-2 text-text-muted">₹{stats.totalEarnings} / ₹{stats.monthlyGoal}</p>
          <div className="w-full bg-bg-hover h-3 rounded-full">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-400 h-3 rounded-full transition-all duration-700"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
        </MotionCard>

        {/* SKILLS */}
        <MotionCard className="p-6 mb-6 bg-bg-card border border-white/10 rounded-2xl">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-text-primary">Skills</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="text-xs text-primary-500 hover:text-primary-400 font-semibold"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          {editing ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill..."
                  className="flex-1 p-2 rounded-lg border border-white/10 bg-bg-main text-text-primary text-sm focus:border-primary-500 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && skillInput.trim()) {
                      saveProfile([...skills, skillInput.trim()]);
                      setSkillInput("");
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (skillInput.trim()) {
                      saveProfile([...skills, skillInput.trim()]);
                      setSkillInput("");
                    }
                  }}
                  className="px-3 py-2 bg-primary-500 text-white rounded-lg text-sm font-semibold"
                >
                  Add
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {skills.map((skill: string) => (
                  <span
                    key={skill}
                    onClick={() => saveProfile(skills.filter((s: string) => s !== skill))}
                    className="px-3 py-1 bg-error-bg/30 text-error-text rounded-full text-sm cursor-pointer hover:bg-error-bg/50 transition-colors"
                  >
                    {skill} ×
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {skills.map((skill: string) => (
                <span key={skill} className="px-3 py-1 bg-bg-hover border border-white/10 rounded-full text-sm text-text-secondary">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </MotionCard>

        {/* RECENT JOBS */}
        <MotionCard className="p-6 bg-bg-card border border-white/10 rounded-2xl">
          <h2 className="font-bold mb-3 text-text-primary">Recent Jobs</h2>
          {jobsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 bg-bg-hover animate-pulse rounded" />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            jobs.slice(0, 5).map((job) => (
              <div key={job.jobId} className="mb-2 flex justify-between text-sm">
                <span className="text-text-secondary">{job.title}</span>
                <span className="text-text-muted">
                  {job.completed ? "✅ Completed" : job.confirmed ? "🔵 Confirmed" : "🟡 Applied"}
                </span>
              </div>
            ))
          ) : (
            <p className="text-text-muted text-sm">No jobs applied yet</p>
          )}
        </MotionCard>

      </PageWrapper>
    </>
  );
}