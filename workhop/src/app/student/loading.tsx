// Student route loading skeleton
export default function StudentLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Availability toggle */}
      <div className="h-16 bg-white/5 rounded-xl border border-white/5" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 bg-white/5 rounded-2xl border border-white/5" />
        ))}
      </div>

      {/* Section header */}
      <div className="h-6 w-40 bg-white/5 rounded-lg" />

      {/* Job cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-44 bg-white/5 rounded-2xl border border-white/5" />
        ))}
      </div>
    </div>
  );
}
