"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { createJob } from "@/services/jobService";
import { getTemplates } from "@/services/templateService";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-bg-main animate-pulse rounded-2xl border border-white/10" />,
});

/* ───────────── TYPES ───────────── */
interface JobForm {
  title: string;
  description: string;
  payment: number;
  duration: number;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  address: string;
  isUrgent: boolean;
  jobType: "instant" | "scheduled";
  peopleRequired: number;
  date: string; // 🔥 Added
  time: string; // 🔥 Added
}

/* ───────────── CONSTANTS ───────────── */
const HOURLY_RATE = 150;

/* ───────────── COMPONENT ───────────── */
export default function PostJobPage() {
  console.log("Post Job Page Rendering");
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();

  const [form, setForm] = useState<JobForm>({
    title: "",
    description: "",
    payment: HOURLY_RATE,
    duration: 1,
    location: { type: "Point", coordinates: [0, 0] },
    address: "",
    isUrgent: false,
    jobType: "instant",
    peopleRequired: 1,
    date: new Date().toISOString().split("T")[0],
    time: "12:00",
  });

  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveTemplate, setSaveTemplate] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ───────────── SEARCH STATE ───────────── */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  /* ───────────── COIMBATORE BOUNDS ───────────── */
  const COIMBATORE = {
    minLat: 10.9,
    maxLat: 11.2,
    minLng: 76.8,
    maxLng: 77.2
  };

  const isInsideCoimbatore = (lat: number, lng: number) => {
    return lat >= COIMBATORE.minLat && lat <= COIMBATORE.maxLat &&
           lng >= COIMBATORE.minLng && lng <= COIMBATORE.maxLng;
  };

  /* ───────────── AUTO PAYMENT ───────────── */
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      payment: Math.round(prev.duration * HOURLY_RATE),
    }));
  }, [form.duration]);

  /* ───────────── DEBOUNCED SEARCH ───────────── */
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Force search in Coimbatore
        const query = `${searchQuery} Coimbatore`;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* ───────────── GEOLOCATION ───────────── */
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return setError("Geolocation not supported");

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        
        if (!isInsideCoimbatore(lat, lng)) {
          setIsLocating(false);
          return setError("Alert: WorkHop currently only supports jobs within Coimbatore city limits.");
        }

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          setForm(prev => ({
            ...prev,
            location: { type: "Point", coordinates: [lng, lat] },
            address: data.display_name
          }));
          setSearchQuery("");
        } catch (err) {
          setError("Failed to fetch address for your location");
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setError("Location access denied. Please search manually.");
      }
    );
  };

  /* ───────────── FETCH TEMPLATES ───────────── */
  useEffect(() => {
    if (!user) return;
    getTemplates()
      .then(setTemplates)
      .catch((err) => console.error("[PostJob] templates fetch:", err));
  }, [user]);

  const update = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ───────────── SUBMIT ───────────── */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.address) {
      return setError("Title and map location required");
    }
    
    if (!user) {
      return setError("User not found or unauthorised");
    }

    try {
      setLoading(true);
      setError("");

      await createJob({ 
        ...form, 
        createdBy: user.uid,
        saveTemplate 
      });

      setSuccess("🚀 Job posted!");
      setTimeout(() => router.push("/business/dashboard"), 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (!user || role !== "business") {
    router.push("/login");
    return null;
  }

  return (
    <>
      <div className="min-h-screen p-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6"
        >

          {/* ───────── TEMPLATE PANEL ───────── */}
          <div className="bg-bg-card rounded-2xl border border-white/10 p-5 shadow-lg">
            <h2 className="font-semibold mb-4 text-text-primary">Templates</h2>

            {templates.length === 0 ? (
              <p className="text-sm text-text-muted">No templates yet</p>
            ) : (
              templates.map((t) => (
                <div
                  key={t.id || t._id}
                  onClick={() => setForm({ ...t })}
                  className="p-4 border border-white/10 rounded-xl mb-2 cursor-pointer bg-bg-main shadow hover:border-primary-500/30 hover:-translate-y-0.5 transition"
                >
                  <p className="font-semibold text-text-primary">{t.title}</p>
                  <p className="text-xs text-text-muted">
                    ₹{t.payment} • {t.duration} hr
                  </p>
                </div>
              ))
            )}
          </div>

          {/* ───────── MAIN FORM ───────── */}
          <div className="lg:col-span-2 bg-bg-card rounded-2xl border border-white/10 p-7 shadow-lg">

            {/* HEADER */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text-primary">
                Post a Job
              </h1>
              <p className="text-sm text-text-muted">
                Get workers in minutes
              </p>
            </div>

            {/* ALERTS */}
            <AnimatePresence>
              {error && (
                <motion.div className="mb-4 text-error-text bg-error-bg/20 p-3 rounded-lg text-sm font-semibold">
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div className="mb-4 text-success-text bg-success-bg/20 p-3 rounded-lg text-sm font-semibold">
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* BASIC */}
              <div className="space-y-4 border-b border-white/10 pb-5">
                <h3 className="text-sm font-semibold text-text-secondary">
                  Basic Info
                </h3>

                <input
                  placeholder="Job Title"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  className="w-full p-3 rounded-xl border border-white/10 bg-bg-main text-text-primary placeholder-text-muted focus:border-primary-500 focus:ring focus:ring-primary-500/30 outline-none transition"
                />

                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  className="w-full p-3 rounded-xl border border-white/10 bg-bg-main text-text-primary placeholder-text-muted focus:border-primary-500 focus:ring focus:ring-primary-500/30 outline-none transition"
                />
              </div>

              {/* DETAILS */}
              <div className="space-y-4 border-b border-white/10 pb-5">
                <h3 className="text-sm font-semibold text-text-secondary">
                  Job Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted uppercase font-bold px-1">Payment</label>
                    <input
                      type="number"
                      value={form.payment}
                      onChange={(e) => update("payment", e.target.value)}
                      className="w-full p-3 rounded-xl border border-white/10 bg-bg-main text-text-primary placeholder-text-muted focus:border-primary-500 focus:ring focus:ring-primary-500/30 outline-none transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted uppercase font-bold px-1">Duration</label>
                    <select
                      value={form.duration}
                      onChange={(e) => update("duration", Number(e.target.value))}
                      className="w-full p-3 rounded-xl border border-white/10 bg-bg-main text-text-primary focus:border-primary-500 outline-none transition"
                    >
                      <option value={1}>1 hr</option>
                      <option value={2}>2 hr</option>
                      <option value={3}>3 hr</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted uppercase font-bold px-1">People Needed</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Number of people needed"
                      value={form.peopleRequired}
                      onChange={(e) => update("peopleRequired", Number(e.target.value))}
                      className="w-full p-3 rounded-xl border border-white/10 bg-bg-main text-text-primary placeholder-text-muted focus:border-primary-500 focus:ring focus:ring-primary-500/30 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted uppercase font-bold px-1">Job Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => update("date", e.target.value)}
                      className="w-full p-3 rounded-xl border border-white/10 bg-bg-main text-text-primary focus:border-primary-500 outline-none transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted uppercase font-bold px-1">Start Time</label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => update("time", e.target.value)}
                      className="w-full p-3 rounded-xl border border-white/10 bg-bg-main text-text-primary focus:border-primary-500 outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                      <input
                        placeholder="Search location (e.g. MG Road, Bangalore)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 rounded-xl border border-white/10 bg-bg-main text-text-primary placeholder-text-muted focus:border-primary-500 focus:ring focus:ring-primary-500/30 outline-none transition"
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-3.5 animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full" />
                      )}
                      
                      {/* SEARCH RESULTS DROPDOWN */}
                      <AnimatePresence>
                        {searchResults.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute z-50 left-0 right-0 mt-2 bg-bg-card border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                          >
                            {searchResults.map((res) => (
                              <button
                                key={res.place_id}
                                type="button"
                                onClick={() => {
                                  setForm(prev => ({
                                    ...prev,
                                    location: { type: "Point", coordinates: [parseFloat(res.lon), parseFloat(res.lat)] },
                                    address: res.display_name
                                  }));
                                  setSearchResults([]);
                                  setSearchQuery("");
                                }}
                                className="w-full text-left p-3 text-sm text-text-muted hover:text-text-primary hover:bg-white/5 transition border-b border-white/5 last:border-0"
                              >
                                {res.display_name}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      disabled={isLocating}
                      className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-text-primary hover:bg-white/10 transition shrink-0 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isLocating ? "Detecting..." : "📍 Use My Location"}
                    </button>
                  </div>

                  {form.address && (
                    <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-xl">
                      <p className="text-xs text-primary-400 font-medium mb-2 flex items-center gap-1">
                         Selected Location
                      </p>
                      <p className="text-sm text-text-primary leading-tight">
                        {form.address}
                      </p>
                    </div>
                  )}

                  <div className="relative group">
                    <MapComponent 
                      initialLocation={form.location.coordinates[0] !== 0 ? [form.location.coordinates[1], form.location.coordinates[0]] : undefined}
                      onSelectLocation={(lat, lng, addr) => {
                        setForm(prev => ({
                          ...prev,
                          location: { type: "Point", coordinates: [lng, lat] },
                          address: addr || prev.address
                        }));
                        setSearchQuery(""); // Clear search on manual select
                      }}
                    />
                    <div className="absolute top-3 left-3 z-[400] bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white/70 uppercase tracking-widest font-bold">
                      Interactive Map
                    </div>
                  </div>
                </div>
              </div>

              {/* OPTIONS */}
              <div className="flex gap-6 text-sm text-text-secondary">
                <label>
                  <input
                    type="checkbox"
                    checked={form.isUrgent}
                    onChange={(e) => update("isUrgent", e.target.checked)}
                  />
                  {" "}Urgent
                </label>

                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => setSaveTemplate(e.target.checked)}
                  />
                  {" "}Save Template
                </label>
              </div>

              {/* CTA */}
              <button
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition disabled:opacity-50"
              >
                {loading ? "Posting..." : "Post Job"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
}