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

// ─── Fetch jobs list ──────────────────────────────────────────────────────────
export async function getJobs(options: GetJobsOptions = {}): Promise<Job[]> {
  const params = new URLSearchParams();
  if (options.createdBy) params.append("createdBy", options.createdBy);
  if (options.status) params.append("status", options.status);
  if (options.applicant) params.append("applicant", options.applicant);
  if (options.limit) params.append("limit", options.limit.toString());

  const res = await fetch(`/api/jobs?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch jobs");
  
  let jobs = await res.json();

  if (options.lat && options.lng) {
    const radiusKm = (options.radius ?? 5000) / 1000;
    const distanceFilter = (j: Job) => {
      const dist = calculateDistance(options.lat!, options.lng!, j.location.coordinates[1], j.location.coordinates[0]);
      return dist <= radiusKm;
    };
    jobs = jobs.filter(distanceFilter);
  }

  return jobs;
}

// ─── Fetch single job ─────────────────────────────────────────────────────────
export async function getJob(jobId: string): Promise<Job> {
  const res = await fetch(`/api/jobs/${jobId}`);
  if (!res.ok) throw new Error("Job not found");
  return res.json();
}

// ─── Create job ───────────────────────────────────────────────────────────────
export async function createJob(payload: any): Promise<Job> {
  // Fetch user profile for businessName if not provided
  let businessName = payload.businessName;
  if (!businessName && payload.createdBy) {
    try {
      const uRes = await fetch(`/api/user?uid=${payload.createdBy}`);
      const userData = await uRes.json();
      businessName = userData.name || userData.email.split("@")[0];
    } catch (e) {
      console.warn("Could not fetch business name for job", e);
    }
  }

  const res = await fetch("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      businessName,
      jobId: `job-${Date.now()}`,
      applicants: [],
      selectedUser: null,
      status: "open",
      createdAt: Date.now(),
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create job");
  }

  return res.json();
}

// ─── Accept job (Student Action - Atomic Locking) ─────────────────────────────
export async function acceptJob(jobId: string, studentId: string): Promise<Job> {
  const res = await fetch(`/api/jobs/${jobId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "accept",
      studentId
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to accept job");
  }
  return res.json();
}

// ─── Apply to job (Add to applicants list) ────────────────────────────────────
export async function applyToJob(jobId: string, userId: string): Promise<Job> {
  const job = await getJob(jobId);
  if (job.applicants.includes(userId)) return job;

  const res = await fetch(`/api/jobs/${jobId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      applicants: [...job.applicants, userId]
    }),
  });

  if (!res.ok) throw new Error("Failed to apply");
  return res.json();
}

// ─── Cancel job (Business Action) ──────────────────────────────────────────────
export async function cancelJob(jobId: string): Promise<Job> {
  const res = await fetch(`/api/jobs/${jobId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "cancel"
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to cancel job");
  }
  return res.json();
}

// ─── Other Actions ───────────────────────────────────────────────────────────
export async function selectWorker(jobId: string, workerUid: string): Promise<Job> {
  const res = await fetch(`/api/jobs/${jobId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      selectedUser: workerUid,
      status: "assigned",
      confirmed: false
    }),
  });

  if (!res.ok) throw new Error("Failed to assign worker");
  return res.json();
}

// ─── Promote backup ───────────────────────────────────────────────────────────
export async function promoteBackup(jobId: string): Promise<Job> {
  const job = await getJob(jobId);
  const nextApplicant = job.applicants.find(a => a !== job.selectedUser);
  if (!nextApplicant) throw new Error("No backup available");

  return selectWorker(jobId, nextApplicant);
}

// ─── Confirm job (Student Action) ─────────────────────────────────────────────
export async function confirmJob(jobId: string): Promise<Job> {
  const res = await fetch(`/api/jobs/${jobId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      confirmed: true,
      status: "assigned"
    }),
  });

  if (!res.ok) throw new Error("Failed to confirm");
  return res.json();
}

export async function checkInJob(jobId: string): Promise<Job> {
  const res = await fetch(`/api/jobs/${jobId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      checkIn: true,
      checkInAt: Date.now(),
      status: "in-progress"
    }),
  });

  if (!res.ok) throw new Error("Check-in failed");
  return res.json();
}

export async function markComplete(jobId: string): Promise<Job> {
  const res = await fetch(`/api/jobs/${jobId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      completed: true,
      checkOutAt: Date.now(),
      status: "completed"
    }),
  });

  if (!res.ok) throw new Error("Failed to complete job");
  return res.json();
}

// ─── Mark paid ────────────────────────────────────────────────────────────────
export async function markPaid(jobId: string): Promise<Job> {
  const res = await fetch(`/api/jobs/${jobId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      paymentStatus: "paid"
    }),
  });

  if (!res.ok) throw new Error("Payment update failed");
  return res.json();
}

// ─── Reject applicant ─────────────────────────────────────────────────────────
export async function rejectApplicant(jobId: string, applicantUid: string): Promise<Job> {
  const job = await getJob(jobId);
  const res = await fetch(`/api/jobs/${jobId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      applicants: job.applicants.filter(a => a !== applicantUid) 
    }),
  });

  if (!res.ok) throw new Error("Failed to reject applicant");
  return res.json();
}

// ─── Repost job ───────────────────────────────────────────────────────────────
export async function repostJob(jobId: string): Promise<Job> {
  const job = await getJob(jobId);
  return createJob({
    ...job,
    _id: undefined,
    id: undefined,
    jobId: undefined,
    applicants: [],
    selectedUser: null,
    status: "open",
    confirmed: false,
    checkIn: false,
    completed: false,
    paymentStatus: "pending",
    createdAt: Date.now()
  });
}

// ─── Distance Calculation ────────────────────────────────────────────────────
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
  return R * c; 
}
