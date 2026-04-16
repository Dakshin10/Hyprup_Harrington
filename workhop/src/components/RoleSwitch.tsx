"use client";

import { useRouter } from "next/navigation";

export default function RoleSwitch() {
  const router = useRouter();

  return (
    <div className="flex gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800">
      <button
        onClick={() => router.push("/student/dashboard")}
        className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white rounded-lg transition"
      >
        Student
      </button>

      <button
        onClick={() => router.push("/business/dashboard")}
        className="px-4 py-2 text-sm font-bold bg-orange-500 text-white rounded-lg transition shadow-lg shadow-orange-500/20"
      >
        Business
      </button>
    </div>
  );
}
