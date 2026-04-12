"use client";

import { useState, useEffect } from "react";
import {
  query,
  collection,
  where,
  onSnapshot,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Job } from "@/types/job";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { JobList } from "@/components/dashboard/JobList";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { ApplicantsModal } from "@/components/modals/ApplicantsModal";

import {
  Briefcase,
  Activity,
  CheckCircle,
  Users,
  DollarSign,
  Star,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

export default function BusinessDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobForModal, setSelectedJobForModal] =
    useState<Job | null>(null);

  const [navigating, setNavigating] = useState(false);

  const [activeTab, setActiveTab] = useState<"instant" | "scheduled">(
    "instant"
  );

  // 🔥 FETCH JOBS
  useEffect(() => {
    if (authLoading) return;

    if (!user || role !== "business") {
      router.push("/login");
      return;
    }

    const q = query(
      collection(db, "jobs"),
      where("createdBy", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedJobs: Job[] = [];

        snapshot.forEach((docSnap) => {
          fetchedJobs.push({
            jobId: docSnap.id,
            ...docSnap.data(),
          } as Job);
        });

        fetchedJobs.sort(
          (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
        );

        setJobs(fetchedJobs);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, role, authLoading, router]);

  // 🔥 HANDLERS
  const handleViewApplicants = (jobId: string) => {
    const job = jobs.find((j) => j.jobId === jobId);
    if (job) {
      setSelectedJobForModal(job);
      setIsModalOpen(true);
    }
  };

  const handleManageJob = (jobId: string) => {
    setNavigating(true);
    router.push(`/business/job/${jobId}`);
  };

  if (authLoading || (!user && !authLoading)) return null;

  // 🔥 STATS
  const totalJobs = jobs.length;

  const activeJobs = jobs.filter((j) =>
    ["open", "assigned", "in-progress"].includes(j.status)
  ).length;

  const completedJobs = jobs.filter(
    (j) => j.status === "completed"
  ).length;

  const totalApplicants = jobs.reduce(
    (sum, j) => sum + (j.applicants?.length || 0),
    0
  );

  const totalSpent = jobs
    .filter((j) => j.paymentStatus === "paid")
    .reduce((sum, j) => sum + (j.payment || 0), 0);

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const weeklySpending = jobs
    .filter(
      (j) =>
        j.paymentStatus === "paid" &&
        j.createdAt > oneWeekAgo
    )
    .reduce((sum, j) => sum + (j.payment || 0), 0);

  const instantJobs = jobs.filter(
    (j) => j.jobType !== "scheduled" && j.status !== "completed"
  );

  const scheduledJobs = jobs.filter(
    (j) => j.jobType === "scheduled" && j.status !== "completed"
  );

  const displayedJobs =
    activeTab === "instant" ? instantJobs : scheduledJobs;

  return (
    <DashboardLayout>
      {navigating && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-bg-card text-text-primary px-6 py-4 rounded-2xl shadow-xl font-semibold flex items-center gap-3 border border-white/10">
            <div className="w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            Loading...
          </div>
        </div>
      )}
      <div className="p-6 space-y-8">

        {/* 🔥 HEADER + CTA */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary">
              Overview
            </h1>
            <p className="text-text-muted">
              Monitor your micro-job performance and applications
            </p>
          </div>

          <button
            onClick={() => {
              setNavigating(true);
              router.push("/business/post-job");
            }}
            className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-2.5 rounded-xl font-semibold text-white shadow-lg shrink-0 hover:scale-[1.02] transition-transform"
          >
            + Post Job
          </button>
        </div>

        {/* 🔥 STATS */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Jobs" value={totalJobs} icon={Briefcase} />
            <StatCard label="Active" value={activeJobs} icon={Activity} />
            <StatCard label="Completed" value={completedJobs} icon={CheckCircle} />
            <StatCard label="Applicants" value={totalApplicants} icon={Users} />
          </div>
        )}

        {/* 🔥 FINANCIAL PANEL */}
        {!loading && (
          <div className="bg-bg-card border border-white/10 shadow-lg p-6 rounded-2xl flex justify-between">
            <div>
              <p className="text-text-muted text-sm">Total Spent</p>
              <h2 className="text-3xl font-bold text-success-text">
                ₹{totalSpent}
              </h2>
            </div>

            <div className="text-right">
              <p className="text-text-muted text-sm">This Week</p>
              <h2 className="text-xl font-bold text-success-text">
                +₹{weeklySpending}
              </h2>
            </div>
          </div>
        )}

        {/* 🔥 JOB SECTION */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-text-primary">
              Manage Listings
            </h2>

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
            <div className="text-center text-text-muted py-10">
              No jobs in this category
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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

        {/* 🔥 MODAL */}
        <ApplicantsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          jobId={selectedJobForModal?.jobId || null}
          applicantUids={selectedJobForModal?.applicants || []}
        />
      </div>
    </DashboardLayout>
  );
}