"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { getJobs, confirmJob, checkInJob } from "@/services/jobService";
import { updateProfile } from "@/services/userService";
import { Job } from "@/types/job";
import Link from "next/link";
import { PageWrapper, StaggerContainer, MotionCard, MotionButton } from "@/components/MotionWrappers";
import { ToastContainer } from "@/components/ui/Toast";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";

const StudentDashboard = () => {
  const { user, role, loading: authLoading } = useAuth();
  const { toasts, toast, dismiss } = useToast();

  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [openJobs, setOpenJobs] = useState<Job[]>([]);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionProcessing, setActionProcessing] = useState<string | null>(null);
  const [available, setAvailable] = useState(true);

  // ─── One-time fetch: job history + open jobs ──────────────────────────────
  useEffect(() => {
    if (authLoading || !user || role !== "student") return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [myFetched, openFetched] = await Promise.all([
          getJobs({ applicant: user.uid, limit: 20 }),
          getJobs({ status: "open", limit: 10 }),
        ]);
        if (cancelled) return;
        setMyJobs(myFetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
        setOpenJobs(openFetched);
      } catch (err) {
        console.error("[StudentDashboard] fetch error:", err);
        toast("Failed to load dashboard data", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [user, role, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Polling: active jobs (replaces onSnapshot) ───────────────────────────
  useEffect(() => {
    if (!user || role !== "student") return;

    const fetchActive = async () => {
      try {
        const jobs = await getJobs({ applicant: user.uid, limit: 10 });
        const active = jobs.filter((j) => j.selectedUser === user.uid && !j.completed);
        setActiveJobs(active);
      } catch (err) {
        console.error("[StudentDashboard] active jobs poll error:", err);
      }
    };

    fetchActive();
    const interval = setInterval(fetchActive, 15_000); // poll every 15s
    return () => clearInterval(interval);
  }, [user, role]);

  // ─── Availability toggle ─────────────────────────────────────────────────
  const toggleAvailability = async () => {
    if (!user) return;
    const newValue = !available;
    setAvailable(newValue);
    try {
      await updateProfile(user.uid, { available: newValue });
    } catch {
      toast("Failed to update availability", "error");
      setAvailable(!newValue); // revert
    }
  };

  // ─── Job action handler ──────────────────────────────────────────────────
  const handleAction = async (jobId: string, action: "confirm" | "checkin") => {
    setActionProcessing(jobId);
    try {
      let updated: Job;
      if (action === "confirm") {
        updated = await confirmJob(jobId);
      } else {
        updated = await checkInJob(jobId);
      }
      setActiveJobs((prev) => prev.map((j) => (j.jobId === jobId ? { ...j, ...updated } : j)));
      toast("Job updated!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed. Try again.";
      toast(msg, "error");
    } finally {
      setActionProcessing(null);
    }
  };

  // ─── Derived stats (memoized) ────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!user) return { pastJobs: [], totalEarnings: 0, jobsCompleted: 0, reliability: 0, progress: 0 };

    const pastJobs = myJobs.filter((j) => j.selectedUser === user.uid && j.completed);
    const totalEarnings = pastJobs
      .filter((j) => j.paymentStatus === "paid")
      .reduce((sum, j) => sum + Number(j.payment || 0), 0);
    const jobsCompleted = pastJobs.length;
    const reliability = myJobs.length > 0 ? Math.round((jobsCompleted / myJobs.length) * 100) : 0;
    const monthlyGoal = 5000;
    const progress = Math.min((totalEarnings / monthlyGoal) * 100, 100);

    return { pastJobs, totalEarnings, jobsCompleted, reliability, progress, monthlyGoal: 5000 };
  }, [myJobs, user]);

  if (authLoading) return <div className="p-6"><LoadingSkeleton /></div>;
  if (!user || role !== "student") return null;

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismiss} />
      <PageWrapper>

        {/* AVAILABILITY TOGGLE */}
        <div className="mb-6 flex items-center justify-between p-4 rounded-xl bg-bg-card border border-white/10">
          <div>
            <p className="font-bold text-text-primary">Available Now</p>
            <p className="text-xs text-text-muted">Get matched faster</p>
          </div>
          <button
            onClick={toggleAvailability}
            className={`w-14 h-7 rounded-full transition-colors ${available ? "bg-success-text" : "bg-bg-hover"}`}
          >
            <div
              className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
                available ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* STATS */}
        <section className="mb-10">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-6 bg-bg-card border border-white/10 rounded-2xl animate-pulse h-28" />
              ))}
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <MotionCard className="p-6 bg-bg-card border border-white/10 rounded-2xl">
                <p className="text-sm text-text-muted">Earnings</p>
                <h2 className="text-3xl font-bold text-primary-500">₹{stats.totalEarnings}</h2>
              </MotionCard>
              <MotionCard className="p-6 bg-bg-card border border-white/10 rounded-2xl">
                <p className="text-sm text-text-muted">Completed</p>
                <h2 className="text-3xl font-bold text-success-text">{stats.jobsCompleted}</h2>
              </MotionCard>
              <MotionCard className="p-6 bg-bg-card border border-white/10 rounded-2xl">
                <p className="text-sm text-text-muted">Active</p>
                <h2 className="text-3xl font-bold text-info-text">{activeJobs.length}</h2>
              </MotionCard>
              <MotionCard className="p-6 bg-bg-card border border-white/10 rounded-2xl">
                <p className="text-sm text-text-muted">Reliability</p>
                <h2 className="text-3xl font-bold text-success-text">{stats.reliability}%</h2>
              </MotionCard>
              <MotionCard className="p-6 bg-bg-card border border-white/10 rounded-2xl">
                <p className="text-sm text-text-muted">Goal</p>
                <h2 className="text-sm font-bold text-text-primary">₹{stats.totalEarnings}/{stats.monthlyGoal}</h2>
                <div className="w-full bg-bg-hover h-2 mt-2 rounded-full">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
              </MotionCard>
            </StaggerContainer>
          )}
        </section>

        {/* ACTIVE TASK FLOW (polling-based) */}
        {activeJobs.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4 text-text-primary">Active Jobs</h2>
            {activeJobs.map((job) => (
              <div key={job.jobId} className="p-6 bg-bg-card border border-white/10 rounded-xl mb-4">
                <h3 className="font-bold text-text-primary">{job.title}</h3>
                <p className="text-sm text-text-muted mt-1">₹{job.payment} • {job.duration}h</p>
                <div className="mt-4 flex gap-3">
                  {!job.confirmed && (
                    <MotionButton
                      onClick={() => handleAction(job.jobId, "confirm")}
                      disabled={actionProcessing === job.jobId}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                    >
                      {actionProcessing === job.jobId ? "..." : "Confirm Job"}
                    </MotionButton>
                  )}
                  {job.confirmed && !job.checkIn && (
                    <MotionButton
                      onClick={() => handleAction(job.jobId, "checkin")}
                      disabled={actionProcessing === job.jobId}
                      className="px-4 py-2 bg-info-text text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                    >
                      {actionProcessing === job.jobId ? "..." : "Check In"}
                    </MotionButton>
                  )}
                  {job.checkIn && !job.completed && (
                    <div className="px-4 py-2 bg-success-bg/20 text-success-text rounded-lg text-sm font-semibold">
                      ✅ Checked In — Awaiting completion
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* RECENT ACTIVITY */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 text-text-primary">Recent Activity</h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-bg-card animate-pulse rounded-lg" />
              ))}
            </div>
          ) : myJobs.length > 0 ? (
            myJobs.slice(0, 5).map((job) => (
              <div key={job.jobId} className="text-sm text-text-muted mb-2 flex justify-between">
                <span className="text-text-secondary">{job.title}</span>
                <span>{job.completed ? "✅ Completed" : job.confirmed ? "🔵 Confirmed" : "🟡 Applied"}</span>
              </div>
            ))
          ) : (
            <p className="text-text-muted">No activity yet</p>
          )}
        </section>

        {/* NEARBY JOBS */}
        <section>
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">Nearby Jobs</h2>
            <Link href="/student/jobs" className="text-primary-500 hover:text-primary-400 text-sm font-semibold">
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-bg-card animate-pulse rounded-xl border border-white/10" />
              ))}
            </div>
          ) : openJobs.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {openJobs.slice(0, 3).map((job) => (
                <div key={job.jobId} className="p-4 bg-bg-card border border-white/10 rounded-xl">
                  <p className="font-bold text-text-primary">{job.title}</p>
                  <p className="text-sm text-text-muted mt-1">₹{job.payment} • {job.duration}h</p>
                  {job.isUrgent && (
                    <span className="text-xs bg-error-bg/30 text-error-text px-2 py-0.5 rounded-full font-bold mt-2 inline-block">
                      🔥 Urgent
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted">No jobs available nearby</p>
          )}
        </section>

      </PageWrapper>
    </>
  );
};

export default StudentDashboard;