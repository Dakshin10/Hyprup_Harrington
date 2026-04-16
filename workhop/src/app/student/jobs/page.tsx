"use client";

import StudentJobsClient from "./StudentJobsClient";

export default function JobsPage() {
  console.log("Student Jobs Page Rendering");
  return <StudentJobsClient initialJobs={[]} />;
}