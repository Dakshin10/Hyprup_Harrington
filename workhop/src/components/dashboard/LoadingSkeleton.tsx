"use client";

import React from "react";

export const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse h-64 flex flex-col justify-between">
          <div>
            <div className="w-1/3 h-6 bg-slate-200 dark:bg-slate-800 rounded-full mb-6"></div>
            <div className="w-1/2 h-5 bg-slate-200 dark:bg-slate-800 rounded-full mb-8"></div>
          </div>
          <div className="flex gap-3 mt-auto">
            <div className="w-full h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
