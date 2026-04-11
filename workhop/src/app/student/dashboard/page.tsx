"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Job } from "@/types/job";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageWrapper, StaggerContainer, MotionCard, MotionButton } from "@/components/MotionWrappers";

const StarRating = ({ rating, onRate, disabled }: { rating: number, onRate: (r: number) => void, disabled: boolean }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={disabled}
          onClick={() => onRate(star)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            rating >= star 
              ? "text-amber-400" 
              : "text-slate-300 dark:text-slate-600 hover:text-amber-200"
          } ${disabled && rating < star ? "opacity-30" : ""} ${!disabled ? "hover:scale-110 active:scale-95" : "cursor-default"}`}
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
        </button>
      ))}
    </div>
  );
};

const Timeline = ({ job }: { job: Job }) => {
  const steps = [
    { label: "Assigned",  active: true },
    { label: "Confirmed", active: !!job.confirmed },
    { label: "Checked-In",active: !!(job.checkIn || job.completed || job.status === "completed") },
    { label: "Completed", active: !!(job.completed || job.status === "completed") },
    { label: "Paid",      active: job.paymentStatus === "paid" },
  ];

  return (
    <div className="w-full py-4 mb-6 overflow-x-auto">
      <div className="flex items-center justify-between relative min-w-[340px]">
        <div className="absolute top-4 left-0 w-full h-1 bg-brand-border -z-10 rounded-full" />
        {steps.map((step) => (
          <div key={step.label} className="flex flex-col items-center gap-2 bg-brand-panel px-1 relative">
            <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all ${
              step.active
                ? "bg-primary border-primary/20 shadow-[0_0_12px_rgba(234,88,12,0.4)] scale-110"
                : "bg-white border-brand-border"
            }`}>
              {step.active && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider whitespace-nowrap ${
              step.active ? "text-primary" : "text-brand-text-secondary"
            }`}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const { user, role, loading: authLoading } = useAuth();
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [actionProcessing, setActionProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!user || role !== "student") return;

    // Track standard user allocations
    const qMy = query(collection(db, "jobs"), where("applicants", "array-contains", user.uid));
    const unsubMy = onSnapshot(qMy, (snapshot) => {
      let fetchedJobs: Job[] = [];
      snapshot.forEach((doc) => fetchedJobs.push(doc.data() as Job));
      fetchedJobs = fetchedJobs.sort((a, b) => b.createdAt - a.createdAt);
      setMyJobs(fetchedJobs);
      setLoading(false);
    });

    // Sub-Query Available feed implicitly for previews
    const qOpen = query(collection(db, "jobs"), where("status", "==", "open"));
    const unsubOpen = onSnapshot(qOpen, (snapshot) => {
      let fetched: Job[] = [];
      snapshot.forEach((doc) => fetched.push(doc.data() as Job));
      fetched = fetched.sort((a, b) => b.createdAt - a.createdAt);
      setAllJobs(fetched);
    });

    return () => { unsubMy(); unsubOpen(); };
  }, [user, role]);

  const handleAction = async (jobId: string, payload: Partial<Job>) => {
    setActionProcessing(jobId);
    try {
      await updateDoc(doc(db, "jobs", jobId), payload);
    } catch (err) {
      alert("Failed action.");
    } finally {
      setActionProcessing(null);
    }
  };

  if (authLoading) return null; // DashboardLayout handles this
  if (!user || role !== "student") return null;

  // Overview Derivations
  const activeJobs = myJobs.filter(j => j.selectedUser === user.uid && (!j.completed || j.status !== "completed"));
  const pastJobs = myJobs.filter(j => j.selectedUser === user.uid && (j.completed || j.status === "completed"));
  
  const totalEarnings = pastJobs.filter(j => j.paymentStatus === 'paid').reduce((sum, j) => sum + (Number(j.payment) || 0), 0);
  const jobsCompletedCount = pastJobs.length;
  const avgRating = pastJobs.filter(j => j.ratingByBusiness).reduce((sum, j) => sum + (j.ratingByBusiness || 0), 0) / (pastJobs.filter(j => j.ratingByBusiness).length || 1);

  return (
    <DashboardLayout>
      <PageWrapper>
        
        {/* OVERVIEW CARDS */}
        <section className="mb-10">
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             <MotionCard className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Total Earnings</p>
                <div className="flex items-end gap-2 text-slate-900 dark:text-white">
                  <span className="text-4xl font-extrabold text-orange-500">${totalEarnings}</span>
                  <span className="text-sm mb-1 text-slate-400">USD</span>
                </div>
             </MotionCard>
             <MotionCard className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Jobs Completed</p>
                <span className="text-4xl font-extrabold text-teal-500">{jobsCompletedCount}</span>
             </MotionCard>
             <MotionCard className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Upcoming/Active</p>
                <span className="text-4xl font-extrabold text-indigo-500">{activeJobs.length}</span>
             </MotionCard>
             <MotionCard className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Avg Rating</p>
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-extrabold text-amber-400">{avgRating ? avgRating.toFixed(1) : "—"}</span>
                  <svg className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
             </MotionCard>
          </StaggerContainer>
        </section>

        {loading ? (
           <div className="flex items-center justify-center py-20"><svg className="animate-spin h-8 w-8 text-orange-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
        ) : (
          <div className="space-y-12">
            
            {/* ACTIVE JOBS */}
            {activeJobs.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Active Tasks</h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {activeJobs.map(job => (
                    <div key={job.jobId} className="bg-white dark:bg-slate-900 rounded-2xl border border-orange-500/20 shadow-lg shadow-orange-500/5 overflow-hidden flex flex-col relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl -z-10 rounded-full"></div>
                      <div className="p-6 bg-orange-50/10 dark:bg-slate-800/20 flex-1 z-10">
                        <Timeline job={job} />
                        
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{job.title}</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="block text-xs uppercase text-slate-500 font-bold mb-1">Payment</span>
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">${job.payment}</span>
                          </div>
                          <div>
                            <span className="block text-xs uppercase text-slate-500 font-bold mb-1">Time</span>
                            <span className="font-bold text-slate-900 dark:text-white">{job.duration} Hr{job.duration > 1 && 's'}</span>
                          </div>
                          <div className="col-span-2 mt-2">
                             <span className="block text-xs uppercase text-slate-500 font-bold mb-1">Location Address</span>
                             <span className="font-bold text-indigo-600 dark:text-indigo-400 break-all">{job.location}</span>
                          </div>
                        </div>

                        {/* ── Step 1: Confirm ──────────────────────────────── */}
                        {!job.confirmed ? (
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
                              <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                              <div>
                                <p className="font-bold text-amber-900">Confirmation Required</p>
                                <p className="text-amber-700 text-xs mt-0.5">Let the business know you'll show up. Click below to confirm your attendance.</p>
                              </div>
                            </div>
                            <MotionButton
                              onClick={() => handleAction(job.jobId, { confirmed: true })}
                              disabled={actionProcessing === job.jobId}
                              className="w-full py-4 bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                              I'll Be There ✓
                            </MotionButton>
                          </div>

                        /* ── Step 2: Check-In ─────────────────────────────── */
                        ) : !job.checkIn ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                              Attendance Confirmed! Head to the location and check in.
                            </div>
                            <MotionButton
                              onClick={() => handleAction(job.jobId, { checkIn: true, checkInAt: Date.now(), status: "in-progress" })}
                              disabled={actionProcessing === job.jobId}
                              className="w-full py-4 bg-gradient-to-tr from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                              Check-In — I'm Here
                            </MotionButton>
                          </div>

                        /* ── Step 3: Complete ─────────────────────────────── */
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-bold text-teal-700 bg-teal-50 p-3 rounded-xl border border-teal-200">
                              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                              <span>
                                Checked In
                                {job.checkInAt && (
                                  <span className="font-normal text-teal-700/80 ml-1">
                                    at {new Date(job.checkInAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                                  </span>
                                )}
                                &nbsp;&mdash; Complete the task to get paid!
                              </span>
                            </div>
                            <MotionButton
                              onClick={() => handleAction(job.jobId, { completed: true, checkOutAt: Date.now(), status: "completed", paymentStatus: "pending" })}
                              disabled={actionProcessing === job.jobId}
                              className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                              Submit Proof &amp; Finish
                            </MotionButton>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* PAST/COMPLETED JOBS */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Completed & Payment</h2>
                {pastJobs.length > 0 ? (
                  <div className="space-y-4">
                    {pastJobs.map(job => (
                      <div key={job.jobId} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        
                        <Timeline job={job} />

                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1 pr-4">{job.title}</h4>
                          <span className="font-black text-slate-900 dark:text-white">${job.payment}</span>
                        </div>
                        
                        <div className="mt-6 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                          {job.paymentStatus === 'paid' ? (
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-bold text-emerald-600 flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Funds Released</span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                               <span className="text-sm font-bold text-amber-600 flex items-center gap-1"><svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Waiting on business payment...</span>
                            </div>
                          )}
                        </div>

                        {/* Rating block */}
                        {job.paymentStatus === 'paid' && (
                           <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col items-center">
                              <span className="text-xs uppercase font-bold text-slate-500 mb-3">Rate the Business</span>
                              <StarRating 
                                 rating={job.ratingByStudent || 0} 
                                 disabled={!!job.ratingByStudent}
                                 onRate={(val) => handleAction(job.jobId, { ratingByStudent: val })}
                              />
                              {job.ratingByStudent && <span className="text-xs text-emerald-600 font-bold mt-2">Thanks for rating!</span>}
                           </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No completed jobs yet.</p>
                )}
              </section>

              {/* AVAILABLE JOBS PREVIEW */}
              <section>
                <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                   <h2 className="text-xl font-bold text-slate-900 dark:text-white">Available Local Jobs</h2>
                   <Link href="/student/jobs" className="text-orange-600 dark:text-orange-400 font-bold text-sm tracking-tight flex items-center hover:underline">
                     View Hub <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                   </Link>
                </div>
                {allJobs.slice(0, 3).length > 0 ? (
                  <div className="space-y-4">
                    {allJobs.slice(0, 3).map(job => (
                      <MotionCard key={job.jobId} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group cursor-pointer" onClick={() => window.location.href = '/student/jobs'}>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1 leading-tight group-hover:text-orange-600 transition-colors">{job.title}</h4>
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold px-2 py-1 rounded inline-block">{job.duration}h • ₹{job.payment}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-500 flex items-center justify-center shrink-0">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </MotionCard>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No new jobs posted yet.</p>
                )}
              </section>
            </div>
          </div>
        )}
      </PageWrapper>
    </DashboardLayout>
  );
};

export default StudentDashboard;
