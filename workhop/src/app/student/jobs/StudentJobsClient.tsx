"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { applyToJob } from "@/services/jobService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Job } from "@/types/job";
import { PageWrapper, StaggerContainer, MotionCard, MotionButton } from "@/components/MotionWrappers";
import { ToastContainer } from "@/components/ui/Toast";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";

import { getJobs } from "@/services/jobService";
import dynamic from "next/dynamic";

type FilterOptions = "all" | "nearby" | "high-paying" | "short";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-bg-main animate-pulse rounded-2xl border border-white/10" />,
});

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default function StudentJobsClient({ initialJobs }: { initialJobs: Job[] }) {
  const { user, role, loading: authLoading } = useAuth();
  const { toasts, toast, dismiss } = useToast();

  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterOptions>("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [radius, setRadius] = useState(5000);
  const [fetching, setFetching] = useState(false);

  // ─── Get Location ───────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Location denied", err)
      );
    }
  }, []);

  // ─── Initial Load ────────────────────────────────────────────────────────
  useEffect(() => {
    // Load baseline jobs immediately
    const loadJobs = async () => {
      try {
        const baseline = await getJobs({ status: "open" });
        setJobs(baseline || []);
      } catch (err) {
        console.error("Failed to load baseline jobs:", err);
      }
    };
    loadJobs();
  }, []);

  // ─── Fetch Nearby Jobs (Refinement) ───────────────────────────────────────
  const fetchNearby = useCallback(async () => {
    if (!userLocation) return;
    setFetching(true);
    try {
      const nearby = await getJobs({
        status: "open",
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius,
      });
      setJobs(nearby);
    } catch (err) {
      toast("Failed to update nearby jobs", "error");
    } finally {
      setFetching(false);
    }
  }, [userLocation, radius, toast]);

  const handleApply = useCallback(async (jobId: string) => {
    if (!user) return;
    setApplyingTo(jobId);
    try {
      await applyToJob(jobId, user.uid);
      setJobs(jobs.map((j) =>
        j.jobId === jobId ? { ...j, applicants: [...(j.applicants || []), user.uid] } : j
      ));
      toast("Applied successfully! 🎉", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to apply. Please try again.";
      toast(msg, "error");
    } finally {
      setApplyingTo(null);
    }
  }, [user, jobs, toast]);

  const processedJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    let result = [...jobs];

    if (userLocation) {
      result.sort((a, b) => {
        const dA = calculateDistance(userLocation.lat, userLocation.lng, a.location.coordinates[1], a.location.coordinates[0]);
        const dB = calculateDistance(userLocation.lat, userLocation.lng, b.location.coordinates[1], b.location.coordinates[0]);
        return dA - dB;
      });
    }

    if (filter === "high-paying") result = result.filter((j) => j.payment >= 500);
    if (filter === "short") result = result.filter((j) => (j.duration || 0) <= 2);

    return result;
  }, [jobs, filter, userLocation]);

  if (authLoading) return <div className="p-6"><LoadingSkeleton /></div>;
  if (!user || role !== "student") return null;

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismiss} />
      <PageWrapper>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-text-primary">Find Jobs</h1>
          
          <div className="flex bg-bg-card border border-white/10 rounded-xl p-1 shadow-inner">
            <button 
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === "list" ? "bg-primary-500 text-white shadow" : "text-text-muted hover:text-text-primary"}`}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode("map")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === "map" ? "bg-primary-500 text-white shadow" : "text-text-muted hover:text-text-primary"}`}
            >
              Map
            </button>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                  (err) => toast("Location access denied", "error")
                );
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-bg-card border border-white/10 rounded-xl text-sm font-bold text-text-primary hover:bg-white/5 transition"
          >
            📍 Detect My Location
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Radius:</span>
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="bg-bg-card border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-text-primary outline-none focus:border-primary-500 transition"
            >
              <option value={1000}>1 km</option>
              <option value={3000}>3 km</option>
              <option value={5000}>5 km</option>
              <option value={10000}>10 km</option>
              <option value={20000}>20 km</option>
            </select>
          </div>
          
          {fetching && <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full ml-2" />}
        </div>

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

        {/* JOB GRID / MAP */}
        {processedJobs.length > 0 && (
          <>
            {viewMode === "list" ? (
              <StaggerContainer className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {processedJobs.map((job) => {
                  const hasApplied = job.applicants?.includes(user.uid);
                  const isApplying = applyingTo === job.jobId;
                  const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, job.location.coordinates[1], job.location.coordinates[0]) : null;

                  return (
                    <MotionCard key={job.jobId} className="p-6 rounded-xl bg-bg-card border border-white/10 shadow-lg">
                      <div className="flex justify-between mb-3">
                        <div className="flex gap-2 flex-wrap">
                          {job.isUrgent && <span className="text-xs bg-error-bg/30 text-error-text px-2 py-1 rounded-full font-bold">🔥 Urgent</span>}
                          {job.payment >= 500 && <span className="text-xs bg-warning-bg/30 text-warning-text px-2 py-1 rounded-full font-bold">💰 High Pay</span>}
                        </div>
                        {distance !== null && (
                          <span className={`text-sm font-semibold ${distance < 2 ? "text-success-text" : "text-text-muted"}`}>
                            📍 {distance.toFixed(1)} km
                          </span>
                        )}
                      </div>

                      <h2 className="font-bold text-lg text-text-primary">{job.title}</h2>
                      <p className="text-sm text-text-muted mt-1">₹{job.payment} • {job.duration} hr</p>
                      {job.address && <p className="text-xs text-text-muted mt-2 line-clamp-1">🏠 {job.address}</p>}

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
            ) : (
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <MapComponent 
                  jobs={processedJobs} 
                  initialLocation={userLocation ? [userLocation.lat, userLocation.lng] : undefined}
                />
              </div>
            )}
          </>
        )}
      </PageWrapper>
    </>
  );
}
