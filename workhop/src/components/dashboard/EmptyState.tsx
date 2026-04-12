"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Rocket } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-12 text-center border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
      <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <Rocket size={40} />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">You haven't posted any jobs yet</h2>
      <p className="text-slate-500 mb-6 max-w-md">Create your first posting to start getting applicants from local students. It only takes a minute!</p>
      <Link href="/business/post-job">
        <Button variant="primary">Create a Job</Button>
      </Link>
    </div>
  );
};
