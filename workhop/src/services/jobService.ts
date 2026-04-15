import { apiFetch } from "./api";
import type { Job } from "@/types/job";

interface GetJobsOptions {
  createdBy?: string;
  status?: string;
  applicant?: string;
  limit?: number;
}

// ─── Fetch jobs list ──────────────────────────────────────────────────────────
export async function getJobs(options: GetJobsOptions = {}): Promise<Job[]> {
  const params = new URLSearchParams();
  if (options.createdBy) params.set("createdBy", options.createdBy);
  if (options.status) params.set("status", options.status);
  if (options.applicant) params.set("applicant", options.applicant);
  if (options.limit) params.set("limit", String(options.limit));

  const data = await apiFetch<{ jobs: Job[] }>(`/api/jobs?${params}`);
  return data.jobs;
}

// ─── Fetch single job ─────────────────────────────────────────────────────────
export async function getJob(jobId: string): Promise<Job> {
  const data = await apiFetch<{ job: Job }>(`/api/jobs/${jobId}`);
  return data.job;
}

// ─── Create job ───────────────────────────────────────────────────────────────
interface CreateJobPayload {
  title: string;
  description?: string;
  payment: number;
  duration: number;
  location: string;
  isUrgent: boolean;
  jobType: "instant" | "scheduled";
  slots: number;
  saveTemplate?: boolean;
}

export async function createJob(payload: CreateJobPayload): Promise<Job> {
  const data = await apiFetch<{ job: Job }>("/api/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.job;
}

// ─── Apply to job ─────────────────────────────────────────────────────────────
export async function applyToJob(jobId: string): Promise<Job> {
  const data = await apiFetch<{ job: Job }>(`/api/jobs/${jobId}/apply`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return data.job;
}

// ─── Select worker ────────────────────────────────────────────────────────────
export async function selectWorker(jobId: string, workerUid: string): Promise<Job> {
  const data = await apiFetch<{ job: Job }>(`/api/jobs/${jobId}/select-worker`, {
    method: "POST",
    body: JSON.stringify({ workerUid }),
  });
  return data.job;
}

// ─── Promote backup ───────────────────────────────────────────────────────────
export async function promoteBackup(jobId: string): Promise<Job> {
  const data = await apiFetch<{ job: Job }>(`/api/jobs/${jobId}/promote-backup`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return data.job;
}

// ─── Confirm job ──────────────────────────────────────────────────────────────
export async function confirmJob(jobId: string): Promise<Job> {
  const data = await apiFetch<{ job: Job }>(`/api/jobs/${jobId}/confirm`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return data.job;
}

// ─── Check in ─────────────────────────────────────────────────────────────────
export async function checkInJob(jobId: string): Promise<Job> {
  const data = await apiFetch<{ job: Job }>(`/api/jobs/${jobId}/checkin`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return data.job;
}

// ─── Mark complete ────────────────────────────────────────────────────────────
export async function markComplete(jobId: string): Promise<Job> {
  const data = await apiFetch<{ job: Job }>(`/api/jobs/${jobId}/complete`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return data.job;
}

// ─── Mark paid ────────────────────────────────────────────────────────────────
export async function markPaid(jobId: string): Promise<Job> {
  const data = await apiFetch<{ job: Job }>(`/api/jobs/${jobId}/pay`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return data.job;
}

// ─── Reject applicant ─────────────────────────────────────────────────────────
export async function rejectApplicant(jobId: string, applicantUid: string): Promise<Job> {
  const data = await apiFetch<{ job: Job }>(`/api/jobs/${jobId}/reject-applicant`, {
    method: "POST",
    body: JSON.stringify({ applicantUid }),
  });
  return data.job;
}

// ─── Repost job ───────────────────────────────────────────────────────────────
export async function repostJob(jobId: string): Promise<Job> {
  const data = await apiFetch<{ job: Job }>(`/api/jobs/${jobId}/repost`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return data.job;
}
