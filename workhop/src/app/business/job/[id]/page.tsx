"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import { QRCode } from "@/components/ui/QRCode";
import { motion } from "framer-motion";
import Link from "next/link";

type Job = {
  jobId: string;
  title: string;
  description?: string;
  payment: number;
  duration: number;
  location: string;
  status: string;
  applicants?: string[];
  selectedUser?: string | null;
  confirmed?: boolean;
  checkIn?: boolean;
  completed?: boolean;
  paymentStatus?: string;
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    open: "bg-warning-bg/30 text-warning-text",
    assigned: "bg-info-bg/30 text-info-text",
    "in-progress": "bg-primary-500/20 text-primary-400",
    completed: "bg-success-bg/30 text-success-text",
  };
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full border border-white/10 ${styles[status] || "bg-bg-hover text-text-muted"}`}>
      {status}
    </span>
  );
};

export default function JobDetailPage() {
  const { id } = useParams();
  const { user, role, loading: authLoading } = useAuth();
  const { toasts, toast, dismiss } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // ─── Fetch once with getDoc (not onSnapshot) ─────────────────────────────
  const fetchJob = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "jobs", id as string));
      if (snap.exists()) {
        setJob({ jobId: snap.id, ...(snap.data() as Omit<Job, "jobId">) });
      } else {
        setJob(null);
      }
    } catch (err) {
      console.error("[JobDetail] fetch error:", err);
      toast("Failed to load job details", "error");
    } finally {
      setLoading(false);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!authLoading && user && role === "business") {
      fetchJob();
    }
  }, [user, role, authLoading, fetchJob]);

  // ─── Optimistic update helper ─────────────────────────────────────────────
  const updateJob = useCallback(async (payload: Partial<Job>, successMsg: string) => {
    if (!job) return;
    setProcessing(true);
    try {
      await updateDoc(doc(db, "jobs", job.jobId), payload);
      setJob((prev) => (prev ? { ...prev, ...payload } : prev));
      toast(successMsg, "success");
    } catch {
      toast("Action failed. Please try again.", "error");
    } finally {
      setProcessing(false);
    }
  }, [job, toast]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const selectWorker = (uid: string) =>
    updateJob({ selectedUser: uid, status: "assigned" }, "Worker assigned!");

  const promoteBackup = () => {
    const backup = job?.applicants?.find((u) => u !== job?.selectedUser);
    if (!backup) {
      toast("No backup applicant available", "info");
      return;
    }
    updateJob({ selectedUser: backup, confirmed: false, checkIn: false, status: "assigned" }, "Backup promoted!");
  };

  const markCompleted = () =>
    updateJob({ status: "completed", completed: true, paymentStatus: "pending" }, "Job marked complete!");

  const markPaid = () =>
    updateJob({ paymentStatus: "paid" }, "Payment marked! ✅");

  // ─── Loading states ───────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-white/5 rounded-2xl border border-white/5" />
          ))}
        </div>
        <div className="h-48 bg-white/5 rounded-2xl border border-white/5" />
      </div>
    );
  }

  if (!user || role !== "business") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <p className="text-text-muted">Access denied</p>
          <Link href="/login" className="text-primary-500 hover:underline font-semibold">Go to Login</Link>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <p className="text-text-muted text-lg font-semibold">Job not found</p>
          <Link href="/business/jobs" className="text-primary-500 hover:underline text-sm">
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismiss} />
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto mb-4">
          <Link href="/business/jobs" className="text-text-muted hover:text-text-primary text-sm font-semibold transition flex items-center gap-1">
            ← Back to Jobs
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6"
        >
          {/* JOB INFO */}
          <div className="bg-bg-card border border-white/10 rounded-2xl p-6 shadow-lg">
            <StatusBadge status={job.status} />

            <h1 className="text-2xl font-bold mt-4 text-text-primary">{job.title}</h1>
            <p className="text-text-muted mt-2 text-sm">{job.description}</p>

            <div className="mt-6 space-y-2 text-sm text-text-secondary">
              <p>💰 ₹{job.payment}</p>
              <p>⏱ {job.duration} hrs</p>
              <p>📍 {job.location}</p>
            </div>

            <button
              onClick={fetchJob}
              disabled={loading || processing}
              className="mt-6 text-xs text-text-muted hover:text-text-primary border border-white/10 px-3 py-1.5 rounded-lg transition"
            >
              🔄 Refresh
            </button>
          </div>

          {/* APPLICANTS */}
          <div className="bg-bg-card border border-white/10 rounded-2xl p-6 shadow-lg">
            <h2 className="font-bold text-lg mb-4 text-text-primary">
              Applicants ({job.applicants?.length || 0})
            </h2>

            {!job.applicants?.length ? (
              <div className="text-center text-text-muted py-8">
                <p className="text-lg mb-1">👀</p>
                <p className="font-medium">No applicants yet</p>
                <p className="text-sm mt-1 text-text-muted">Share your job to get applicants faster</p>
              </div>
            ) : (
              job.applicants.map((uid) => (
                <div
                  key={uid}
                  className="flex justify-between items-center border border-white/10 bg-bg-main p-4 rounded-xl mb-3 hover:border-primary-500/40 transition-colors"
                >
                  <span className="text-sm font-semibold text-text-primary truncate mr-4 font-mono">
                    {uid.slice(0, 16)}…
                  </span>

                  {!job.selectedUser && (
                    <button
                      onClick={() => selectWorker(uid)}
                      disabled={processing}
                      className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition disabled:opacity-50"
                    >
                      {processing ? "..." : "Select"}
                    </button>
                  )}

                  {job.selectedUser === uid && (
                    <span className="text-success-text font-bold text-sm bg-success-bg/30 px-3 py-1 rounded-full">
                      Assigned ✓
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* EXECUTION PANEL */}
          {job.selectedUser && (
            <div className="bg-bg-card border border-white/10 rounded-2xl p-6 shadow-lg md:col-span-2">
              <h2 className="font-bold text-xl mb-6 text-text-primary">Job Execution</h2>

              {!job.confirmed && (
                <div className="bg-error-bg/20 border border-error-bg/40 p-4 rounded-xl mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-error-text font-semibold">Worker not confirmed yet</p>
                    <p className="text-xs text-text-muted mt-0.5">If they don't respond, promote a backup</p>
                  </div>
                  <button
                    onClick={promoteBackup}
                    disabled={processing}
                    className="ml-4 bg-error-text text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                  >
                    {processing ? "..." : "Promote Backup"}
                  </button>
                </div>
              )}

              {job.confirmed && !job.checkIn && (
                <div className="text-center py-6 bg-bg-main border border-white/10 rounded-xl">
                  <p className="mb-4 text-text-secondary font-semibold">Show QR code for worker check-in</p>
                  <QRCode value={job.jobId} />
                </div>
              )}

              {job.checkIn && (
                <div className="bg-success-bg/20 border border-success-bg/40 p-4 rounded-xl flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <p className="text-success-text font-bold text-lg">Worker Checked In</p>
                </div>
              )}

              {job.status === "in-progress" && (
                <button
                  onClick={markCompleted}
                  disabled={processing}
                  className="bg-primary-500 hover:bg-primary-600 font-semibold text-white px-5 py-3 rounded-xl mt-6 w-full md:w-auto shadow-md transition disabled:opacity-50"
                >
                  {processing ? "Processing..." : "Mark Completed"}
                </button>
              )}

              {job.status === "completed" && job.paymentStatus !== "paid" && (
                <button
                  onClick={markPaid}
                  disabled={processing}
                  className="bg-success-text hover:bg-emerald-600 font-semibold text-white px-5 py-3 rounded-xl mt-6 w-full md:w-auto shadow-md transition disabled:opacity-50"
                >
                  {processing ? "Processing..." : "Mark as Paid"}
                </button>
              )}

              {job.paymentStatus === "paid" && (
                <div className="bg-success-bg/20 border border-success-bg/40 p-4 rounded-xl mt-6">
                  <p className="text-success-text font-extrabold text-lg flex items-center gap-2">
                    ✅ Payment Completed
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}