"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import { getJob, acceptJob } from "@/services/jobService";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { PageWrapper } from "@/components/MotionWrappers";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-white/5 animate-pulse rounded-xl" />,
});

export default function StudentJobDetails() {
  const { id } = useParams();
  const { user, role, loading: authLoading } = useAuth();
  const { toasts, toast, dismiss } = useToast();
  const router = useRouter();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchJob = async () => {
      try {
        const data = await getJob(id as string);
        setJob(data);
      } catch (err) {
        toast("Could not find job details", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleAccept = async () => {
    if (!user || !job) return;
    setProcessing(true);
    try {
      const updated = await acceptJob(job.jobId, user.uid);
      setJob(updated);
      toast("🚀 Job accepted! You are now assigned.", "success");
    } catch (err: any) {
      toast(err.message || "Failed to accept job", "error");
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-8 w-64 bg-white/5 rounded-lg mb-4" />
        <div className="h-40 w-full bg-white/5 rounded-2xl mb-6" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-white/5 rounded" />
          <div className="h-4 w-3/4 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-text-muted mb-4">Job not found</p>
        <Link href="/student/dashboard" className="text-primary-500 font-bold">Back to Dashboard</Link>
      </div>
    );
  }

  const isAssignedToMe = job.assignedUsers?.includes(user?.uid);
  const isCancelled = job.status === "cancelled";
  const slotsLeft = job.peopleRequired - (job.assignedUsers?.length || 0);
  const isFull = job.status === "full" || slotsLeft <= 0;

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismiss} />
      <PageWrapper className="p-6 max-w-4xl mx-auto">
        
        {/* BACK NAVIGATION */}
        <Link href="/student/dashboard" className="text-sm text-text-muted hover:text-text-primary mb-6 inline-block transition">
          ← Back to Dashboard
        </Link>

        {/* HEADER SECTION */}
        <div className="bg-bg-card border border-white/10 rounded-2xl p-8 mb-6 shadow-xl relative overflow-hidden">
          {job.isUrgent && (
            <div className="absolute top-0 right-0 bg-error-text text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-tighter">
              Urgent Focus
            </div>
          )}

          <div className="mb-4">
             <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border ${
              job.status === 'open' && !isFull ? 'border-success-text/40 text-success-text bg-success-bg/10' :
               isAssignedToMe ? 'border-primary-500/40 text-primary-400 bg-primary-500/10' :
               'border-error-text/40 text-error-text bg-error-bg/10'
             }`}>
               {isAssignedToMe ? 'Joined' : isFull ? 'Full' : job.status}
             </span>
          </div>

          <h1 className="text-3xl font-bold text-text-primary mb-2">{job.title}</h1>
          <p className="text-text-muted leading-relaxed mb-6">{job.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 py-6 border-y border-white/5">
            <div>
              <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1">Pay</p>
              <p className="text-xl font-bold text-success-text">₹{job.payment}</p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1">Duration</p>
              <p className="text-xl font-bold text-text-primary">{job.duration} hr</p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1">Date</p>
              <p className="text-lg font-bold text-text-primary">
                {job.date ? new Date(job.date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1">Time</p>
              <p className="text-lg font-bold text-text-primary">{job.time || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1">Slots Left</p>
              <p className="text-lg font-bold text-primary-500">
                {job.assignedUsers?.length || 0} / {job.peopleRequired} joined
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* MAP & LOCATION */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-bg-card border border-white/10 rounded-2xl p-6 shadow-lg">
              <h2 className="font-bold text-text-primary mb-4">Location</h2>
              <div className="h-[250px] rounded-xl overflow-hidden mb-4 border border-white/5">
                <MapComponent 
                  initialLocation={[job.location.coordinates[1], job.location.coordinates[0]]}
                  readOnly={true}
                />
              </div>
              <p className="text-sm text-text-muted flex items-start gap-2">
                <span className="text-primary-500">📍</span>
                {job.address}
              </p>
            </div>
          </div>

          {/* SIDEBAR: SHOP & ACTION */}
          <div className="space-y-6">
            <div className="bg-bg-card border border-white/10 rounded-2xl p-6 shadow-lg">
              <h2 className="font-bold text-text-primary mb-2">Business</h2>
              <p className="text-sm text-text-secondary font-medium">{job.businessName || 'Verified Partner'}</p>
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[10px] text-text-muted uppercase font-bold mb-2">Trust Score</p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => <span key={i} className="text-orange-500 text-xs">★</span>)}
                </div>
              </div>
            </div>

            <div className="bg-bg-card border border-white/10 rounded-2xl p-6 shadow-lg">
               {isAssignedToMe ? (
                 <div className="text-center">
                    <div className="w-12 h-12 bg-success-bg/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-success-text text-xl">✓</span>
                    </div>
                    <p className="font-bold text-success-text">Joined</p>
                    <p className="text-[10px] text-text-muted mt-2">Check your dashboard for execution steps.</p>
                 </div>
               ) : slotsLeft > 0 && !isCancelled ? (
                 <>
                   <button
                     onClick={handleAccept}
                     disabled={processing}
                     className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl shadow-lg hover:shadow-primary-500/20 hover:-translate-y-1 transition disabled:opacity-50"
                   >
                     {processing ? "Securing Job..." : "Accept Job"}
                   </button>
                   <p className="text-center text-sm mt-4 text-text-muted">{slotsLeft} spots left</p>
                 </>
               ) : (
                 <div className="text-center opacity-50">
                    <p className="font-bold text-text-muted">{isCancelled ? 'Job Cancelled' : 'Full'}</p>
                    <p className="text-[10px] text-text-muted mt-1">Look for other open jobs.</p>
                 </div>
               )}
            </div>
          </div>

        </div>

      </PageWrapper>
    </>
  );
}
