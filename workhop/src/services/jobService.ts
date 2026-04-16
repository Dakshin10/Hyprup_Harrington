import { mockDb } from "@/lib/mockDb";
import { Job } from "@/types/job";

interface GetJobsOptions {
  createdBy?: string;
  status?: string;
  applicant?: string;
  lat?: number;
  lng?: number;
  radius?: number; // meters
  limit?: number;
}

// ─── Distance Calculation (Haversine) ──────────────────────────────────────────
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
}

// ─── Fetch jobs list ──────────────────────────────────────────────────────────
export async function getJobs(options: GetJobsOptions = {}): Promise<Job[]> {
  let jobs = mockDb.getJobs();

  if (options.createdBy) jobs = jobs.filter(j => j.createdBy === options.createdBy);
  if (options.status) jobs = jobs.filter(j => j.status === options.status);
  if (options.applicant) jobs = jobs.filter(j => j.applicants.includes(options.applicant!));

  if (options.lat && options.lng) {
    const radiusKm = (options.radius ?? 5000) / 1000;
    jobs = jobs.filter(j => {
      const dist = calculateDistance(options.lat!, options.lng!, j.location.coordinates[1], j.location.coordinates[0]);
      return dist <= radiusKm;
    });
  }

  if (options.limit) jobs = jobs.slice(0, options.limit);
  return jobs;
}

// ─── Fetch single job ─────────────────────────────────────────────────────────
export async function getJob(jobId: string): Promise<Job> {
  const job = mockDb.getJobs().find(j => j.jobId === jobId);
  if (!job) throw new Error("Job not found");
  return job;
}

// ─── Create job ───────────────────────────────────────────────────────────────
export async function createJob(payload: any): Promise<Job> {
  const user = mockDb.getUser();
  const newJob: Job = {
    ...payload,
    jobId: `job-${Date.now()}`,
    createdBy: user?.uid || "demo-user",
    applicants: [],
    selectedUser: null,
    status: "open",
    createdAt: Date.now(),
  };

  mockDb.addJob(newJob);
  return newJob;
}

// ─── Apply to job ─────────────────────────────────────────────────────────────
export async function applyToJob(jobId: string): Promise<Job> {
  const user = mockDb.getUser();
  if (!user) throw new Error("Not logged in");

  mockDb.addApp({
    id: `app-${Date.now()}`,
    jobId,
    userId: user.uid,
    status: "pending",
    appliedAt: Date.now()
  });

  return getJob(jobId);
}

// ─── Select worker ────────────────────────────────────────────────────────────
export async function selectWorker(jobId: string, workerUid: string): Promise<Job> {
  const updated = mockDb.updateJob(jobId, { selectedUser: workerUid, status: "assigned" });
  if (!updated) throw new Error("Failed to update job");
  return updated;
}

// ─── Promote backup ───────────────────────────────────────────────────────────
export async function promoteBackup(jobId: string): Promise<Job> {
  const job = await getJob(jobId);
  const nextApplicant = job.applicants.find(a => a !== job.selectedUser);
  if (!nextApplicant) throw new Error("No backup available");

  return selectWorker(jobId, nextApplicant);
}

// ─── Confirm job ──────────────────────────────────────────────────────────────
export async function confirmJob(jobId: string): Promise<Job> {
  const updated = mockDb.updateJob(jobId, { confirmed: true, status: "assigned" });
  if (!updated) throw new Error("Failed to update job");
  return updated;
}

// ─── Check in ─────────────────────────────────────────────────────────────────
export async function checkInJob(jobId: string): Promise<Job> {
  const updated = mockDb.updateJob(jobId, { checkIn: true, status: "in-progress" });
  if (!updated) throw new Error("Failed to update job");
  return updated;
}

// ─── Mark complete ────────────────────────────────────────────────────────────
export async function markComplete(jobId: string): Promise<Job> {
  const updated = mockDb.updateJob(jobId, { completed: true, status: "completed" });
  if (!updated) throw new Error("Failed to update job");
  return updated;
}

// ─── Mark paid ────────────────────────────────────────────────────────────────
export async function markPaid(jobId: string): Promise<Job> {
  const updated = mockDb.updateJob(jobId, { paymentStatus: "paid" });
  if (!updated) throw new Error("Failed to update job");
  return updated;
}

// ─── Reject applicant ─────────────────────────────────────────────────────────
export async function rejectApplicant(jobId: string, applicantUid: string): Promise<Job> {
  const job = await getJob(jobId);
  const updated = mockDb.updateJob(jobId, { 
    applicants: job.applicants.filter(a => a !== applicantUid) 
  });
  if (!updated) throw new Error("Failed to update job");
  return updated;
}

// ─── Repost job ───────────────────────────────────────────────────────────────
export async function repostJob(jobId: string): Promise<Job> {
  const job = await getJob(jobId);
  return createJob({
    ...job,
    jobId: undefined,
    applicants: [],
    selectedUser: null,
    status: "open",
    createdAt: Date.now()
  });
}
