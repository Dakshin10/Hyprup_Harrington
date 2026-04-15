import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/authMiddleware";
import JobModel from "@/models/Job";

// POST /api/jobs/[id]/select-worker
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await verifyAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const { id } = await params;
  const { workerUid } = await req.json();

  if (!workerUid) return NextResponse.json({ error: "workerUid required" }, { status: 400 });

  try {
    await connectToDatabase();
    const job = await JobModel.findOne({ jobId: id });

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.createdBy !== user.uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!job.applicants.includes(workerUid)) {
      return NextResponse.json({ error: "Worker is not an applicant" }, { status: 400 });
    }

    job.selectedUser = workerUid;
    job.status = "assigned";
    job.confirmed = false;
    await job.save();

    return NextResponse.json({ job });
  } catch (err) {
    console.error("[POST /api/jobs/[id]/select-worker]", err);
    return NextResponse.json({ error: "Failed to select worker" }, { status: 500 });
  }
}
