"use client";

import { useState, useMemo, useCallback } from "react";
import { updateDoc, doc, arrayUnion } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { db } from "@/lib/firebase";
import { Job } from "@/types/job";
import { PageWrapper, StaggerContainer, MotionCard, MotionButton } from "@/components/MotionWrappers";
import { ToastContainer } from "@/components/ui/Toast";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";

type FilterOptions = "all" | "nearby" | "high-paying" | "short";

const getDistance = (jobId: string) => {
  let hash = 0;
  for (let i = 0; i < jobId.length; i++) hash += jobId.charCodeAt(i);
  return (hash % 45) / 10 + 0.5;
};

export default function StudentJobsClient({ initialJobs }: { initialJobs: Job[] }) {
  const { user, role, loading: authLoading } = useAuth();
  const { toasts, toast, dismiss } = useToast();
  
  // We manage the jobs visually so we can optimistically update applying state
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterOptions>("all");

  const handleApply = useCallback(async (jobId: string) => {
    if (!user) return;
    setApplyingTo(jobId);
    try {
      await updateDoc(doc(db, "jobs", jobId), {
        applicants: arrayUnion(user.uid),
      });
      setJobs(jobs.map((j) =>
        j.jobId === jobId ? { ...j, applicants: [...(j.applicants || []), user.uid] } : j
      ));
      toast("Applied successfully! 🎉", "success");
    } catch {
      toast("Failed to apply. Please try again.", "error");
    } finally {
      setApplyingTo(null);
    }
  }, [user, jobs, toast]);

  const processedJobs = useMemo(() => {
    let result = [...jobs];
    result.sort((a, b) => {
      const dA = getDistance(a.jobId);
      const dB = getDistance(b.jobId);
      const scoreA = (dA < 2 ? 2 : 0) + (a.payment > 300 ? 1 : 0) + (a.duration <= 2 ? 1 : 0);
      const scoreB = (dB < 2 ? 2 : 0) + (b.payment > 300 ? 1 : 0) + (b.duration <= 2 ? 1 : 0);
      return scoreB - scoreA;
    });

    if (filter === "nearby") result = result.sort((a, b) => getDistance(a.jobId) - getDistance(b.jobId));
    if (filter === "high-paying") result = result.filter((j) => j.payment >= 500);
    if (filter === "short") result = result.filter((j) => j.duration <= 2);

    return result;
  }, [jobs, filter]);

  if (authLoading) return <div className="p-6"><LoadingSkeleton /></div>;
  if (!user || role !== "student") return null;

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismiss} />
      <PageWrapper>
        <h1 className="text-3xl font-bold mb-6 text-text-primary">Nearby Jobs</h1>

        {/* FILTERS */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
          {(["all", "nearby", "high-paying", "short"] as FilterOptions[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-bold shrink-0 transition-colors ${
                filter === f
                  ? "bg-primary-500 text-white shadow-md"
                  : "bg-bg-card border border-white/10 text-text-secondary hover:text-text-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* EMPTY STATE */}
        {processedJobs.length === 0 && (
          <div className="text-center py-20 bg-bg-card border border-white/10 rounded-2xl">
            <p className="text-text-muted text-lg font-semibold">No jobs available right now</p>
            <p className="text-text-muted text-sm mt-1">Check back soon — new jobs are posted daily!</p>
          </div>
        )}

        {/* JOB GRID */}
        {processedJobs.length > 0 && (
          <StaggerContainer className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {processedJobs.map((job) => {
              const hasApplied = job.applicants?.includes(user.uid);
              const isApplying = applyingTo === job.jobId;
              const distance = getDistance(job.jobId);
              const isGoodMatch = distance < 2 && job.duration <= 2;

              return (
                <MotionCard key={job.jobId} className="p-6 rounded-xl bg-bg-card border border-white/10 shadow-lg">
                  {/* BADGES */}
                  <div className="flex justify-between mb-3">
                    <div className="flex gap-2 flex-wrap">
                      {job.isUrgent && <span className="text-xs bg-error-bg/30 text-error-text px-2 py-1 rounded-full font-bold">🔥 Urgent</span>}
                      {job.payment >= 500 && <span className="text-xs bg-warning-bg/30 text-warning-text px-2 py-1 rounded-full font-bold">💰 High Pay</span>}
                      {job.duration <= 2 && <span className="text-xs bg-info-bg/30 text-info-text px-2 py-1 rounded-full font-bold">⏱ Short</span>}
                      {isGoodMatch && <span className="text-xs bg-success-bg/30 text-success-text px-2 py-1 rounded-full font-bold">✓ Match</span>}
                    </div>
                    <span className={`text-sm font-semibold ${distance < 2 ? "text-success-text" : "text-text-muted"}`}>
                      📍 {distance.toFixed(1)} km
                    </span>
                  </div>

                  <h2 className="font-bold text-lg text-text-primary">{job.title}</h2>
                  <p className="text-sm text-text-muted mt-1">₹{job.payment} • {job.duration} hr</p>

                  <MotionButton
                    onClick={() => handleApply(job.jobId)}
                    disabled={hasApplied || isApplying}
                    className={`mt-4 w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                      hasApplied ? "bg-success-bg/30 text-success-text cursor-default" : "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg disabled:opacity-60"
                    }`}
                  >
                    {isApplying ? "Applying..." : hasApplied ? "Applied ✓" : "Apply Now"}
                  </MotionButton>
                </MotionCard>
              );
            })}
          </StaggerContainer>
        )}
      </PageWrapper>
    </>
  );
}
