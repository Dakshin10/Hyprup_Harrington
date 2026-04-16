"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CheckCircle, Sparkles, Filter, RefreshCw, BookmarkPlus, ArrowRight } from "lucide-react";

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface AIJob {
  id: string;
  job_title: string;
  company_name: string;
  location: string;
  distance: number;
  salary_range: string;
  job_type: string;
  company_score: number;
  skills_required: string[];
}

// ─── MOCK DATASET ───────────────────────────────────────────────────────────
const MOCK_JOBS: AIJob[] = [
  {
    id: "ai_1",
    job_title: "Event Coordination Staff",
    company_name: "GalaEvents Co",
    location: "R S Puram, Coimbatore",
    distance: 2.4,
    salary_range: "₹600 - ₹900",
    job_type: "One-off gig",
    company_score: 92,
    skills_required: ["Communication", "Organizing"],
  },
  {
    id: "ai_2",
    job_title: "Store Assistant (Weekend)",
    company_name: "FreshMart Retail",
    location: "Race Course Rd, Coimbatore",
    distance: 5.1,
    salary_range: "₹400 - ₹550",
    job_type: "Part-time",
    company_score: 65,
    skills_required: ["Inventory", "Customer Service"],
  },
  {
    id: "ai_3",
    job_title: "Tech Support Intern",
    company_name: "CodeCraft Solutions",
    location: "Tidel Park, Coimbatore",
    distance: 8.3,
    salary_range: "₹8000 - ₹12000 /mo",
    job_type: "Internship",
    company_score: 88,
    skills_required: ["Basic IT", "Troubleshooting"],
  },
  {
    id: "ai_4",
    job_title: "Café Barista",
    company_name: "Bean Brew",
    location: "Peelamedu, Coimbatore",
    distance: 14.5,
    salary_range: "₹500 - ₹700",
    job_type: "Part-time",
    company_score: 75,
    skills_required: ["Coffee Making", "Service"],
  },
  {
    id: "ai_5",
    job_title: "Delivery Partner",
    company_name: "QuickDrop Logix",
    location: "Gandhipuram, Coimbatore",
    distance: 1.2,
    salary_range: "₹300 - ₹600",
    job_type: "Part-time",
    company_score: 45,
    skills_required: ["Driving", "Time Management"],
  },
  {
    id: "ai_6",
    job_title: "Graphic Design Volunteer",
    company_name: "NGO CareLine",
    location: "Saibaba Colony, Coimbatore",
    distance: 4.8,
    salary_range: "Unpaid / Certificate",
    job_type: "Internship",
    company_score: 95,
    skills_required: ["Photoshop", "Creativity"],
  },
];

// ─── COMPONENT ──────────────────────────────────────────────────────────────
export const WorkHopAISection = () => {
  const [hasRun, setHasRun] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [recommendedJobs, setRecommendedJobs] = useState<AIJob[]>([]);

  // ─── AI LOGIC SIMULATOR ───────────────────────────────────────────────────
  const runAIProcessing = () => {
    setIsScanning(true);
    setHasRun(true);

    setTimeout(() => {
      // 1. Prioritize & Filter
      // Verified logic: company_score > 70 => verified = true
      let processed = MOCK_JOBS.map((job) => ({
        ...job,
        verified: job.company_score > 70,
      }));

      // In real backend, dropping jobs > 15km. In this mock, all are < 15km.
      processed = processed.filter(j => j.distance <= 15);

      if (showVerifiedOnly) {
        processed = processed.filter(j => j.verified);
      }

      // 2. Sorting
      // By: verified (true first), distance (nearest), company_score (desc)
      processed.sort((a, b) => {
        if (a.verified && !b.verified) return -1;
        if (!a.verified && b.verified) return 1;
        if (a.distance !== b.distance) return a.distance - b.distance;
        return b.company_score - a.company_score;
      });

      setRecommendedJobs(processed);
      setIsScanning(false);
    }, 2000); // 2 second delay
  };

  // Run AI automatically if filter changes after initial run
  useEffect(() => {
    if (hasRun && !isScanning) {
        runAIProcessing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showVerifiedOnly]);

  return (
    <section className="mb-10 relative">
      
      {/* ─── INITIAL HERO TRIGGER ─── */}
      {!hasRun && !isScanning && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-900/40 via-[#0f172a] to-primary-900/20 border border-primary-500/30 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary-500/20 text-primary-400 rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-6 transition-transform">
              <Sparkles size={32} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Let WorkHopAI Pick For You</h2>
            <p className="text-text-muted text-sm sm:text-base">
              Skip the manual search. Our AI scans nearby verified companies, analyzes your skills, and finds the perfect tailored slice of opportunities in seconds.
            </p>
            <button
              onClick={runAIProcessing}
              className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-primary-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-1"
            >
              <Sparkles size={18} />
              <span>Find Jobs with WorkHopAI</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* ─── SCANNING STATE ─── */}
      {isScanning && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 bg-bg-card border border-primary-500/30 rounded-xl p-4 shadow-lg shadow-primary-500/10">
            <div className="h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-primary-400 animate-pulse">
              WorkHopAI is scanning nearby opportunities...
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-bg-card border border-white/5 rounded-2xl p-6 h-48 animate-pulse flex flex-col justify-between">
                <div>
                   <div className="w-3/4 h-6 bg-white/5 rounded mb-3" />
                   <div className="w-1/2 h-4 bg-white/5 rounded" />
                </div>
                <div className="flex gap-2">
                   <div className="w-16 h-6 bg-white/5 rounded-lg" />
                   <div className="w-16 h-6 bg-white/5 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── RESULTS UI ─── */}
      {hasRun && !isScanning && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-card p-4 rounded-xl border border-white/10 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-primary-500" />
              <h2 className="text-lg font-bold text-text-primary">WorkHopAI Recommendations</h2>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Filter Toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary font-semibold hover:text-text-primary transition-colors">
                <input 
                  type="checkbox" 
                  checked={showVerifiedOnly}
                  onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                  className="rounded text-primary-500 focus:ring-primary-500 bg-bg-main border-white/20"
                />
                Show Verified Only
              </label>

              {/* Refresh Button */}
              <button 
                onClick={runAIProcessing}
                className="p-2 text-text-muted hover:text-primary-400 bg-white/5 rounded-lg transition-colors ml-auto sm:ml-0"
                title="Re-run WorkHopAI"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {/* EMPTY STATE */}
          {recommendedJobs.length === 0 ? (
            <div className="text-center bg-bg-card border border-white/10 rounded-2xl py-12 px-6">
               <div className="w-16 h-16 bg-white/5 text-text-muted rounded-full flex items-center justify-center mx-auto mb-4">
                 <Filter size={32} />
               </div>
               <h3 className="text-lg font-bold text-text-primary">No nearby jobs found</h3>
               <p className="text-text-muted text-sm mt-1">Try expanding your preferences or unchecking the verified filter.</p>
            </div>
          ) : (
            
            /* GRID OF JOB CARDS */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {recommendedJobs.map((job: any) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={job.id} 
                    className="bg-bg-card rounded-2xl border border-white/10 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:border-primary-500/30 transition-all flex flex-col"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-text-primary leading-tight">{job.job_title}</h3>
                        <p className="text-sm font-medium text-text-secondary mt-1">{job.company_name}</p>
                      </div>
                      
                      {/* Verification Badge */}
                      {job.verified ? (
                         <span className="shrink-0 flex items-center gap-1 px-2 py-1 bg-success-text/10 text-success-text text-[10px] font-bold uppercase rounded-md border border-success-text/20">
                           <CheckCircle size={10} /> Verified
                         </span>
                      ) : (
                         <span className="shrink-0 px-2 py-1 bg-white/5 text-text-muted text-[10px] font-bold uppercase rounded-md border border-white/10">
                           Unverified
                         </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2 mb-5 flex-1">
                       <div className="flex items-center gap-2 text-xs text-text-muted">
                         <MapPin size={14} /> 
                         <span>{job.location} <span className="font-bold text-primary-400">({job.distance} km)</span></span>
                       </div>
                       <div className="flex flex-wrap gap-2 mt-3">
                          <span className="px-2.5 py-1 bg-warning-bg/20 text-warning-text text-[11px] font-bold rounded-lg border border-warning-text/10">
                            {job.salary_range}
                          </span>
                          <span className="px-2.5 py-1 bg-white/5 text-text-primary text-[11px] font-bold rounded-lg border border-white/5">
                            {job.job_type}
                          </span>
                       </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5 pb-5 border-b border-white/5">
                      <span className="px-2 py-1 flex items-center gap-1 bg-indigo-500/10 text-indigo-400 text-[10px] uppercase font-bold rounded">
                        <Sparkles size={10} /> AI Recommended
                      </span>
                      {job.distance <= 5 && (
                        <span className="px-2 py-1 flex items-center gap-1 bg-info-text/10 text-info-text text-[10px] uppercase font-bold rounded">
                          <MapPin size={10} /> Near You
                        </span>
                      )}
                    </div>

                    {/* Quick Stats (Skills) */}
                    <div className="mb-5">
                       <p className="text-[10px] text-text-muted uppercase font-bold mb-2 tracking-wider">Required Skills</p>
                       <div className="flex gap-2 flex-wrap">
                         {job.skills_required.map((skill: string) => (
                           <span key={skill} className="text-xs text-text-secondary bg-bg-hover px-2 py-1 rounded-md">{skill}</span>
                         ))}
                       </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex gap-3 w-full">
                       <button className="flex-1 bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-bold text-sm py-2.5 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                         Apply <ArrowRight size={14} />
                       </button>
                       <button className="px-4 bg-white/5 text-text-primary hover:bg-white/10 hover:text-white rounded-xl border border-white/10 transition-colors flex items-center justify-center" title="Save Job">
                         <BookmarkPlus size={18} />
                       </button>
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

        </motion.div>
      )}

    </section>
  );
};
