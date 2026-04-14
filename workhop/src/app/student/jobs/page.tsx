import { unstable_cache } from "next/cache";
import { adminDb } from "@/lib/firebaseAdmin";
import StudentJobsClient from "./StudentJobsClient";
import { Job } from "@/types/job";

const getJobs = unstable_cache(
  async () => {
    try {
      if (!process.env.FIREBASE_PROJECT_ID) {
        console.warn("⚠️ Missing Firebase Admin .env variables. Returning empty jobs array on server to avoid crash.");
        return [];
      }
      
      const snap = await adminDb.collection("jobs")
        .where("status", "==", "open")
        .orderBy("createdAt", "desc")
        .limit(20)
        .get();

      return snap.docs.map((doc) => {
        const data = doc.data();
        let createdAtNum = Date.now();
        if (data.createdAt) {
          createdAtNum = typeof data.createdAt.toMillis === 'function' 
            ? data.createdAt.toMillis() 
            : data.createdAt;
        }

        return {
          id: doc.id,
          jobId: doc.id,
          title: data.title || "",
          description: data.description || "",
          payment: data.payment || 0,
          duration: data.duration || 0,
          location: data.location || "",
          createdBy: data.createdBy || "",
          applicants: data.applicants || [],
          selectedUser: data.selectedUser || null,
          status: data.status || "open",
          isUrgent: data.isUrgent || false,
          createdAt: createdAtNum,
        } as unknown as Job;
      });
    } catch (error) {
      console.error("Error fetching jobs in Server Component:", error);
      return [];
    }
  },
  ["student-jobs-cache"],
  { revalidate: 60 }
);

export default async function JobsPage() {
  const initialJobs = await getJobs();
  return <StudentJobsClient initialJobs={initialJobs} />;
}