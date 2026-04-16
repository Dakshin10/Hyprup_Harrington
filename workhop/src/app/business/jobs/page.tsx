"use client";

import { useState, useMemo, useCallback, memo, useEffect } from "react";
import { useJobs } from "@/hooks/useJobs";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { repostJob } from "@/services/jobService";
import { getUserProfile } from "@/services/userService";
import type { Job } from "@/types/job";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PageWrapper } from "@/components/MotionWrappers";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { ToastContainer } from "@/components/ui/Toast";

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-warning-bg/30 text-warning-text",
    assigned: "bg-info-bg/30 text-info-text",
    "in-progress": "bg-primary-500/20 text-primary-400",
    completed: "bg-success-bg/30 text-success-text",
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${styles[status] || "bg-bg-hover text-text-muted"}`}>
      {status}
    </span>
  );
});

// ─── WORKER CELL ─────────────────────────────────────────────────────────────
const WorkerCell = memo(function WorkerCell({ uid }: { uid: string }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getUserProfile(uid)
      .then((profile) => { if (alive && profile?.email) setEmail(profile.email); })
      .catch(console.error);
    return () => { alive = false; };
  }, [uid]);

  return (
    <div className="flex flex-col">
      <span className="font-semibold text-sm text-text-primary">{email || "Loading..."}</span>
      <span className="text-xs text-success-text font-bold">92% reliability</span>
    </div>
  );
});

// ─── JOB CARD ────────────────────────────────────────────────────────────────
const JobCard = memo(function JobCard({ job, onRepost }: { job: Job; onRepost: (job: Job) => void }) {
  return (
    <motion.div
      layout
      whileHover={{ y: -5 }}
      className="bg-bg-card border border-white/10 rounded-2xl p-5 shadow-lg hover:shadow-xl hover:border-primary-500/30 transition-colors"
    >
      <div className="flex justify-between items-center mb-2">
        <StatusBadge status={job.status} />
        {job.isUrgent && (
          <span className="text-xs text-error-text font-bold animate-pulse">🔥 Urgent</span>
        )}
      </div>

      <h3 className="font-bold text-lg text-text-primary">{job.title}</h3>

      <div className="mt-3 text-sm text-text-secondary space-y-1">
        <p>💰 ₹{job.payment}</p>
        <p>⏱ {job.duration} hrs</p>
        <p>👥 {job.applicants?.length || 0} applicants</p>
      </div>

      {job.selectedUser && (
        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="text-xs text-text-muted mb-1">Assigned</p>
          <WorkerCell uid={job.selectedUser} />
        </div>
      )}

      <div className="mt-4 flex justify-between items-center">
        <Link
          href={`/business/job/${job.jobId}`}
          className="text-sm text-primary-500 hover:text-primary-400 font-semibold transition"
        >
          Manage →
        </Link>
        {job.status === "completed" && (
          <button
            onClick={() => onRepost(job)}
            className="text-xs bg-bg-hover text-text-primary px-3 py-1 rounded-md border border-white/10 hover:border-primary-500 transition"
          >
            Repost
          </button>
        )}
      </div>
    </motion.div>
  );
});

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function BusinessJobsPage() {
  const { user, role, loading: authLoading } = useAuth();
  const { toasts, toast, dismiss } = useToast();

  const { setJobs } = useStore();
  const { jobs, loading: loadingJobs, refetch } = useJobs({
    createdBy: user?.uid,
    maxResults: 30,
    skip: authLoading || !user || role !== "business",
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // ─── Repost handler ───────────────────────────────────────────────────────
  const handleRepost = useCallback(async (job: Job) => {
    try {
      const newJob = await repostJob(job.jobId);
      setJobs([newJob, ...jobs]);
      toast("🚀 Job reposted successfully!", "success");
    } catch {
      toast("Failed to repost job", "error");
    }
  }, [jobs, toast, setJobs]);

  // ─── Filtered list (memoized) ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    return jobs
      .filter((j) => (j.title || "").toLowerCase().includes(search.toLowerCase()))
      .filter((j) => filter === "all" || j.status === filter);
  }, [jobs, search, filter]);

  if (authLoading) return <div className="p-6"><LoadingSkeleton /></div>;

  if (!user || role !== "business") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-text-secondary">Unauthorized access</p>
          <Link href="/login" className="text-primary-500 hover:underline">Return to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismiss} />
      <PageWrapper>
        <div className="p-6 space-y-6">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Job Tracker</h1>
              <p className="text-text-muted">Manage and track all jobs</p>
            </div>
            <Link
              href="/business/post-job"
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:scale-[1.02] transition-transform"
            >
              + Post Job
            </Link>
          </div>

          {/* SEARCH */}
          <input
            placeholder="Search jobs..."
            className="px-4 py-3 border border-white/10 rounded-xl w-full md:w-80 bg-bg-main text-text-primary placeholder-text-muted focus:border-primary-500 focus:ring focus:ring-primary-500/30 outline-none transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* FILTERS */}
          <div className="flex gap-3 flex-wrap">
            {["all", "open", "assigned", "completed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 font-semibold text-sm rounded-full transition-colors border ${
                  filter === f
                    ? "bg-primary-500 text-white border-primary-500 shadow-md"
                    : "bg-bg-card text-text-secondary border-white/10 hover:border-primary-500/50 hover:text-text-primary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* GRID */}
          {loadingJobs ? (
            <LoadingSkeleton />
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-bg-card border border-white/10 rounded-2xl">
              <h3 className="text-xl font-bold text-text-primary">No jobs yet 🚀</h3>
              <p className="text-text-muted mt-2 mb-6 text-sm">Post a job to get started!</p>
              <Link
                href="/business/post-job"
                className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-xl transition"
              >
                Create Job
              </Link>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div layout className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((job) => (
                  <JobCard key={job.jobId} job={job} onRepost={handleRepost} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </PageWrapper>
    </>
  );
}