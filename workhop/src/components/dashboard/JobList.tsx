"use client";

import React from "react";
import { motion } from "framer-motion";
import { Job } from "@/types/job";
import { JobCard } from "./JobCard";

interface JobListProps {
  jobs: Job[];
  onViewApplicants: (jobId: string) => void;
  onManageJob: (jobId: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const JobList = ({ jobs, onViewApplicants, onManageJob }: JobListProps) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      {jobs.map((job) => (
        <JobCard
          key={job.jobId}
          job={job}
          onViewApplicants={onViewApplicants}
          onManageJob={onManageJob}
        />
      ))}
    </motion.div>
  );
};
