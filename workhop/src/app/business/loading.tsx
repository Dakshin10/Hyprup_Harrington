// Business route loading skeleton
export default function BusinessLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-44 bg-white/5 rounded-xl" />
          <div className="h-4 w-64 bg-white/5 rounded-lg" />
        </div>
        <div className="h-10 w-28 bg-white/5 rounded-xl" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/5" />
        ))}
      </div>

      {/* Financial panel */}
      <div className="h-24 bg-white/5 rounded-2xl border border-white/5" />

      {/* Job list */}
      <div className="space-y-4">
        <div className="h-6 w-40 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-white/5 rounded-2xl border border-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
