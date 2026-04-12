"use client";

import React from "react";
import { motion } from "framer-motion";
import { Job } from "@/types/job";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface JobCardProps {
  job: Job;
  onViewApplicants: (jobId: string) => void;
  onManageJob: (jobId: string) => void;
}

export const JobCard = ({ job, onViewApplicants, onManageJob }: JobCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between h-full"
    >
      <div className="p-6 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1">{job.title}</h2>
          <Badge
            variant={
              job.status === "open"
                ? "open"
                : job.status === "assigned"
                  ? "assigned"
                  : "completed"
            }
          >
            {job.status}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 mt-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <b className="text-slate-900 dark:text-white">Pay:</b> ₹{job.payment}
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <b className="text-slate-900 dark:text-white">Time:</b> {job.duration}h
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50/50 dark:bg-slate-900/20 flex-1 flex flex-col justify-end">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold rounded-full flex items-center justify-center">
              {job.applicants?.length || 0}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Applicants</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full">
          {job.status === "open" ? (
            <Button
              variant="primary"
              fullWidth
              onClick={() => onViewApplicants(job.jobId)}
            >
              Review Applicants
            </Button>
          ) : (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => onManageJob(job.jobId)}
            >
              Manage Job
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
