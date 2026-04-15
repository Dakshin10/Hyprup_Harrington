import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/authMiddleware";
import JobModel from "@/models/Job";

// POST /api/jobs/[id]/promote-backup
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await verifyAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const { id } = await params;

  try {
    await connectToDatabase();
    const job = await JobModel.findOne({ jobId: id });

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.createdBy !== user.uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Find next eligible applicant (not the current selectedUser)
    const backup = job.applicants.find((uid) => uid !== job.selectedUser);
    if (!backup) {
      return NextResponse.json({ error: "No backup applicant available" }, { status: 400 });
    }

    job.backupUser = job.selectedUser;
    job.selectedUser = backup;
    job.confirmed = false;
    job.checkIn = false;
    job.status = "assigned";
    await job.save();

    return NextResponse.json({ job });
  } catch (err) {
    console.error("[POST /api/jobs/[id]/promote-backup]", err);
    return NextResponse.json({ error: "Failed to promote backup" }, { status: 500 });
  }
}
