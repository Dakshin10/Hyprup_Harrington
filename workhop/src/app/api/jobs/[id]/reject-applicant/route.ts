import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/authMiddleware";
import JobModel from "@/models/Job";

// POST /api/jobs/[id]/reject-applicant
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await verifyAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const { id } = await params;
  const { applicantUid } = await req.json();

  if (!applicantUid) return NextResponse.json({ error: "applicantUid required" }, { status: 400 });

  try {
    await connectToDatabase();
    const job = await JobModel.findOne({ jobId: id });

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.createdBy !== user.uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    job.applicants = job.applicants.filter((uid) => uid !== applicantUid);
    await job.save();

    return NextResponse.json({ job });
  } catch (err) {
    console.error("[POST /api/jobs/[id]/reject-applicant]", err);
    return NextResponse.json({ error: "Failed to reject applicant" }, { status: 500 });
  }
}
