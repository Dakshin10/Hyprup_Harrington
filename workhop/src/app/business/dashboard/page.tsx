"use client";

import { useState, useEffect, useMemo } from "react";
import { useJobs } from "@/hooks/useJobs";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Job } from "@/types/job";

import { StatCard } from "@/components/dashboard/StatCard";
import { JobList } from "@/components/dashboard/JobList";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { ApplicantsModal } from "@/components/modals/ApplicantsModal";
import { ToastContainer } from "@/components/ui/Toast";

import {
  Briefcase,
  Activity,
  CheckCircle,
  Users,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

export default function BusinessDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const { toasts, toast, dismiss } = useToast();

  const { jobs, loading } = useJobs({
    createdBy: user?.uid,
    maxResults: 20,
    skip: authLoading || !user || role !== "business",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobForModal, setSelectedJobForModal] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<"instant" | "scheduled">("instant");

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleViewApplicants = (jobId: string) => {
    const job = jobs.find((j) => j.jobId === jobId);
    if (job) {
      setSelectedJobForModal(job);
      setIsModalOpen(true);
    }
  };

  const handleManageJob = (jobId: string) => {
    // Navigation handled by Link in JobCard — no router.push needed
    void jobId;
  };

  // ─── Stats (memoized) ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) =>
      ["open", "assigned", "in-progress"].includes(j.status)
    ).length;
    const completedJobs = jobs.filter((j) => j.status === "completed").length;
    const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicants?.length || 0), 0);
    const totalSpent = jobs
      .filter((j) => j.paymentStatus === "paid")
      .reduce((sum, j) => sum + (j.payment || 0), 0);
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklySpending = jobs
      .filter((j) => j.paymentStatus === "paid" && j.createdAt > oneWeekAgo)
      .reduce((sum, j) => sum + (j.payment || 0), 0);

    return { totalJobs, activeJobs, completedJobs, totalApplicants, totalSpent, weeklySpending };
  }, [jobs]);

  // ─── Tab-filtered job lists (memoized) ──────────────────────────────────
  const { instantJobs, scheduledJobs, displayedJobs } = useMemo(() => {
    const instant = jobs.filter((j) => j.jobType !== "scheduled" && j.status !== "completed");
    const scheduled = jobs.filter((j) => j.jobType === "scheduled" && j.status !== "completed");
    return {
      instantJobs: instant,
      scheduledJobs: scheduled,
      displayedJobs: activeTab === "instant" ? instant : scheduled,
    };
  }, [jobs, activeTab]);

  if (authLoading) return <div className="p-6"><LoadingSkeleton /></div>;
  if (!user || role !== "business") return null;

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismiss} />
      <div className="p-6 space-y-8">

        {/* HEADER + CTA */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary">Overview</h1>
            <p className="text-text-muted">Monitor your micro-job performance and applications</p>
          </div>

          <Link
            href="/business/post-job"
            className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-2.5 rounded-xl font-semibold text-white shadow-lg shrink-0 hover:scale-[1.02] transition-transform"
          >
            + Post Job
          </Link>
        </div>

        {/* STATS */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-bg-card border border-white/10 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Jobs" value={stats.totalJobs} icon={Briefcase} />
            <StatCard label="Active" value={stats.activeJobs} icon={Activity} />
            <StatCard label="Completed" value={stats.completedJobs} icon={CheckCircle} />
            <StatCard label="Applicants" value={stats.totalApplicants} icon={Users} />
          </div>
        )}

        {/* FINANCIAL PANEL */}
        {!loading && (
          <div className="bg-bg-card border border-white/10 shadow-lg p-6 rounded-2xl flex justify-between">
            <div>
              <p className="text-text-muted text-sm">Total Spent</p>
              <h2 className="text-3xl font-bold text-success-text">₹{stats.totalSpent}</h2>
            </div>
            <div className="text-right">
              <p className="text-text-muted text-sm">This Week</p>
              <h2 className="text-xl font-bold text-success-text">+₹{stats.weeklySpending}</h2>
            </div>
          </div>
        )}

        {/* JOB SECTION */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-text-primary">Manage Listings</h2>

            <div className="flex bg-bg-hover border border-white/5 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("instant")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === "instant"
                    ? "bg-bg-card shadow text-text-primary"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Today ({instantJobs.length})
              </button>
              <button
                onClick={() => setActiveTab("scheduled")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === "scheduled"
                    ? "bg-bg-card shadow text-text-primary"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Upcoming ({scheduledJobs.length})
              </button>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : jobs.length === 0 ? (
            <EmptyState />
          ) : displayedJobs.length === 0 ? (
            <div className="text-center text-text-muted py-10">No jobs in this category</div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <JobList
                  jobs={displayedJobs}
                  onViewApplicants={handleViewApplicants}
                  onManageJob={handleManageJob}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* MODAL */}
        <ApplicantsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          jobId={selectedJobForModal?.jobId || null}
          applicantUids={selectedJobForModal?.applicants || []}
        />
      </div>
    </>
  );
}