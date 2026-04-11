"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  onSnapshot,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { QRCode } from "@/components/ui/QRCode";
import { motion } from "framer-motion";
import Link from "next/link";

type Job = any;

export default function JobApplicantsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // 🔥 FETCH JOB
  useEffect(() => {
    if (!user || role !== "business" || !id) return;

    const ref = doc(db, "jobs", id as string);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setJob({
          jobId: snap.id,
          ...snap.data(),
        });
      } else {
        setJob(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [user, role, id]);

  // 🔥 ACTIONS
  const selectWorker = async (uid: string) => {
    setProcessing(true);
    await updateDoc(doc(db, "jobs", job.jobId), {
      selectedUser: uid,
      status: "assigned",
    });
    setProcessing(false);
  };

  const promoteBackup = async () => {
    if (!job?.applicants) return;

    const backup = job.applicants.find(
      (u: string) => u !== job.selectedUser
    );

    if (!backup) return alert("No backup available");

    setProcessing(true);
    await updateDoc(doc(db, "jobs", job.jobId), {
      selectedUser: backup,
      confirmed: false,
      checkIn: false,
      status: "assigned",
    });
    setProcessing(false);
  };

  const markCompleted = async () => {
    setProcessing(true);
    await updateDoc(doc(db, "jobs", job.jobId), {
      status: "completed",
      completed: true,
      paymentStatus: "pending",
    });
    setProcessing(false);
  };

  const markPaid = async () => {
    setProcessing(true);
    await updateDoc(doc(db, "jobs", job.jobId), {
      paymentStatus: "paid",
    });
    setProcessing(false);
  };

  // 🔥 STATES
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main">
        <p className="text-primary-500 font-bold animate-pulse">
          Loading Job...
        </p>
      </div>
    );
  }

  if (!user || role !== "business") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Link href="/login">Go Login</Link>
      </div>
    );
  }

  if (!job) return <div>Job not found</div>;

  return (
    <DashboardLayout>
      <div className="min-h-screen p-6">

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6"
        >

          {/* 🔥 JOB INFO */}
          <div className="bg-bg-card border border-white/10 rounded-2xl p-6 shadow-lg">
            <span className="text-xs font-bold px-3 py-1 bg-warning-bg text-warning-text rounded-full border border-warning-text/20">
              {job.status}
            </span>

            <h1 className="text-2xl font-bold mt-4 text-text-primary">
              {job.title}
            </h1>

            <p className="text-text-muted mt-2">
              {job.description}
            </p>

            <div className="mt-6 space-y-3 text-sm text-text-secondary">
              <p>💰 ₹{job.payment}</p>
              <p>⏱ {job.duration} hrs</p>
              <p>📍 {job.location}</p>
            </div>
          </div>

          {/* 🔥 APPLICANTS */}
          <div className="bg-bg-card border border-white/10 rounded-2xl p-6 shadow-lg">
            <h2 className="font-bold text-lg mb-4 text-text-primary">
              Applicants ({job.applicants?.length || 0})
            </h2>

            {!job.applicants?.length ? (
              <div className="text-center text-text-muted py-8">
                No applicants yet
              </div>
            ) : (
              job.applicants.map((uid: string) => (
                <div
                  key={uid}
                  className="flex justify-between items-center border border-white/10 bg-bg-main p-4 rounded-xl mb-3 shadow-sm hover:border-primary-500/50 transition-colors"
                >
                  <span className="text-sm font-semibold text-text-primary truncate mr-4">{uid}</span>

                  {!job.selectedUser && (
                    <button
                      onClick={() => selectWorker(uid)}
                      className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition"
                    >
                      Select
                    </button>
                  )}

                  {job.selectedUser === uid && (
                    <span className="text-success-text font-bold text-sm bg-success-bg px-3 py-1 rounded-full">
                      Assigned
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 🔥 EXECUTION PANEL */}
          {job.selectedUser && (
            <div className="bg-bg-card border border-white/10 rounded-2xl p-6 shadow-lg md:col-span-2">

              <h2 className="font-bold text-xl mb-6 text-text-primary">
                Job Execution
              </h2>

              {!job.confirmed && (
                <div className="bg-error-bg/20 border border-error-bg p-4 rounded-xl mb-4 flex items-center justify-between shadow-sm">
                  <span className="text-error-text font-semibold">Worker not confirmed</span>
                  <button
                    onClick={promoteBackup}
                    disabled={processing}
                    className="ml-4 bg-error-text text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Promote Backup
                  </button>
                </div>
              )}

              {job.confirmed && !job.checkIn && (
                <div className="text-center py-6 bg-bg-main border border-white/10 rounded-xl shadow-inner">
                  <p className="mb-4 text-text-secondary font-semibold">Show QR for check-in</p>
                  <QRCode value={job.jobId} />
                </div>
              )}

              {job.checkIn && (
                <div className="bg-success-bg/20 border border-success-bg p-4 rounded-xl flex items-center shadow-sm">
                  <p className="text-success-text font-bold text-lg">
                    ✅ Worker Checked In
                  </p>
                </div>
              )}

              {job.status === "in-progress" && (
                <button
                  onClick={markCompleted}
                  className="bg-primary-500 hover:bg-primary-600 font-semibold text-white px-5 py-3 rounded-xl mt-6 w-full md:w-auto shadow-md transition"
                >
                  Mark Completed
                </button>
              )}

              {job.status === "completed" &&
                job.paymentStatus !== "paid" && (
                  <button
                    onClick={markPaid}
                    className="bg-success-text hover:bg-emerald-600 font-semibold text-white px-5 py-3 rounded-xl mt-6 w-full md:w-auto shadow-md transition"
                  >
                    Mark Paid
                  </button>
                )}

              {job.paymentStatus === "paid" && (
                <div className="bg-success-bg/20 border border-success-bg p-4 rounded-xl mt-6 shadow-sm">
                  <p className="text-success-text font-extrabold text-lg flex items-center gap-2">
                    ✅ Payment Completed
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}