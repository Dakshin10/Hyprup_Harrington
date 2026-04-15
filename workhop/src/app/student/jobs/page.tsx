import { connectToDatabase } from "@/lib/mongodb";
import JobModel from "@/models/Job";
import StudentJobsClient from "./StudentJobsClient";
import { Job } from "@/types/job";

// Always render dynamically — depends on live MongoDB connection
export const dynamic = "force-dynamic";


async function getOpenJobs(): Promise<Job[]> {
  try {
    await connectToDatabase();
    const docs = await JobModel.find({ status: "open" })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return docs.map((doc) => ({
      id: doc.jobId,
      jobId: doc.jobId,
      title: doc.title || "",
      description: doc.description || "",
      payment: doc.payment || 0,
      duration: doc.duration || 0,
      location: doc.location || "",
      createdBy: doc.createdBy || "",
      applicants: doc.applicants || [],
      selectedUser: doc.selectedUser || null,
      status: doc.status || "open",
      isUrgent: doc.isUrgent || false,
      createdAt: doc.createdAt || Date.now(),
    })) as unknown as Job[];
  } catch (error) {
    console.error("[Student Jobs Server] Error fetching jobs:", error);
    return [];
  }
}

export default async function JobsPage() {
  const initialJobs = await getOpenJobs();
  return <StudentJobsClient initialJobs={initialJobs} />;
}