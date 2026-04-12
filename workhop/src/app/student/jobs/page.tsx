"use client";

import { useState, useEffect, useMemo } from "react";
import { query, collection, onSnapshot, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Job } from "@/types/job";
import Link from "next/link";
import { PageWrapper, StaggerContainer, MotionCard, MotionButton } from "@/components/MotionWrappers";

type FilterOptions = "all" | "nearby" | "high-paying" | "short";

const StudentJobsPage = () => {
  const { user, role, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterOptions>("all");

  useEffect(() => {
    // Fetch all jobs, we will filter status="open" client side
    // to easily pair with our sorting algorithm
    const q = query(collection(db, "jobs"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedJobs: Job[] = [];
      snapshot.forEach((docSnap) => {
        fetchedJobs.push(docSnap.data() as Job);
      });
      setJobs(fetchedJobs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching jobs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApply = async (jobId: string) => {
    if (!user) return;
    
    setApplyingTo(jobId);
    try {
      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, {
        applicants: arrayUnion(user.uid)
      });
    } catch (error) {
      console.error("Error applying to job:", error);
      alert("Failed to apply. Please try again.");
    } finally {
      setApplyingTo(null);
    }
  };

  // Generate a consistent pseudo-random distance based on string hash for the demo
  const getSimulatedDistance = (jobId: string) => {
    let hash = 0;
    for (let i = 0; i < jobId.length; i++) hash += jobId.charCodeAt(i);
    return ((hash % 45) / 10 + 0.5); // between 0.5km and 5.0km
  };

  // Data processing: Filtering and Sorting
  const processedJobs = useMemo(() => {
    let result = jobs.filter(j => j.status === "open");

    // Default Sort: Latest first
    result = result.sort((a, b) => b.createdAt - a.createdAt);

    if (filter === "nearby") {
      result = result.sort((a, b) => getSimulatedDistance(a.jobId) - getSimulatedDistance(b.jobId));
    } else if (filter === "high-paying") {
      // Assuming ₹500+ is high paying for this micro-job scale
      result = result.filter(j => j.payment >= 500).sort((a, b) => b.payment - a.payment); 
    } else if (filter === "short") {
      result = result.filter(j => j.duration === 1);
    }

    return result;
  }, [jobs, filter]);

  // Auth Protection
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    );
  }

  if (!user || role !== "student") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center shadow-inner">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-red-500/10">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h1 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">Access Denied</h1>
        <p className="text-slate-500 mb-8 max-w-sm">Unauthorized. Only registered student accounts have access to browse and apply for local opportunities.</p>
        <Link href="/login" className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg">
          Sign in as Student
        </Link>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <PageWrapper className="pb-20 bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500/30">
        
        {/* Hero Section */}
        <div className="bg-slate-900 text-white py-14 px-6 md:rounded-3xl relative overflow-hidden border-b-4 border-indigo-500 mb-8 mx-auto xl:mr-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500 rounded-full mix-blend-screen blur-[128px] opacity-20 transform translate-x-1/3 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-400 rounded-full mix-blend-multiply blur-[128px] opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="max-w-6xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              Discover Daily Missions
            </h1>
            <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
              Fast, flexible micro-jobs near your campus. Instant applications, zero resume required.
            </p>
          </div>
        </div>

      <main className="max-w-6xl mx-auto px-6 mt-8">
        
        {/* Filters Menu */}
        <div className="flex overflow-x-auto gap-3 pb-4 mb-6 scrollbar-hide">
          <button 
            onClick={() => setFilter("all")}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${filter === "all" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"}`}
          >
            All Latest Jobs
          </button>
          <button 
            onClick={() => setFilter("nearby")}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${filter === "nearby" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"}`}
          >
            📍 Nearby Locations
          </button>
          <button 
            onClick={() => setFilter("high-paying")}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${filter === "high-paying" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 hover:border-emerald-200"}`}
          >
            💸 High Paying (₹500+)
          </button>
          <button 
            onClick={() => setFilter("short")}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${filter === "short" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 hover:border-indigo-200"}`}
          >
            ⚡ Short Duration (1 Hr)
          </button>
        </div>

        {/* State: Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse h-64">
                <div className="w-1/3 h-5 bg-slate-200 dark:bg-slate-800 rounded-full mb-6"></div>
                <div className="w-3/4 h-7 bg-slate-200 dark:bg-slate-800 rounded-full mb-3"></div>
                <div className="w-1/2 h-5 bg-slate-200 dark:bg-slate-800 rounded-full mb-8"></div>
                <div className="flex gap-3 mb-6">
                  <div className="w-24 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                  <div className="w-24 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* State: Empty */}
        {!loading && processedJobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner text-slate-400 dark:text-slate-600">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No jobs found</h3>
            <p className="text-slate-500 max-w-md">There are currently no open positions matching this filter. Try clearing your filters or check back later!</p>
          </div>
        )}

        {/* List: Jobs */}
        {!loading && processedJobs.length > 0 && (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
            {processedJobs.map((job) => {
              const hasApplied = user ? job.applicants?.includes(user.uid) : false;
              const isApplying = applyingTo === job.jobId;
              const distance = getSimulatedDistance(job.jobId).toFixed(1);

              return (
                <MotionCard 
                  key={job.jobId} 
                  className="group bg-white dark:bg-slate-900/80 rounded-[2rem] p-7 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-2">
                        {job.status === "open" && (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                            Open
                          </span>
                        )}
                        {job.isUrgent && (
                          <span className="px-3 py-1 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1 shadow-sm">
                            Urgent🔥
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {distance} km
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-tight">
                      {job.title}
                    </h2>

                    {job.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {job.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3 mt-6">
                       <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center gap-2">
                         <span className="font-extrabold flex items-center text-indigo-700 dark:text-indigo-400">
                           <span className="text-sm mr-0.5">₹</span>{job.payment}
                         </span>
                       </div>
                       
                       <div className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                         <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         {job.duration} Hr{job.duration > 1 ? 's' : ''}
                       </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                    <MotionButton
                      onClick={() => handleApply(job.jobId)}
                      disabled={hasApplied || isApplying}
                      className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center ${
                        hasApplied
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-none cursor-not-allowed border border-emerald-100 dark:border-emerald-500/20"
                          : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-200 dark:shadow-none"
                      }`}
                    >
                      {isApplying ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Applying...
                        </>
                      ) : hasApplied ? (
                        <>
                          <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          Applied ✅
                        </>
                      ) : (
                        "Apply Now"
                      )}
                    </MotionButton>
                  </div>
                </MotionCard>
              );
            })}
          </StaggerContainer>
        )}
      </main>
    </PageWrapper>
    </DashboardLayout>
  );
};

export default StudentJobsPage;
