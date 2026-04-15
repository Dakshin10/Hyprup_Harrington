import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/authMiddleware";
import JobModel from "@/models/Job";

// POST /api/jobs/[id]/apply
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await verifyAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const { id } = await params;

  try {
    await connectToDatabase();
    const job = await JobModel.findOne({ jobId: id });

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.status !== "open") return NextResponse.json({ error: "Job is not open" }, { status: 400 });
    if (job.applicants.includes(user.uid)) {
      return NextResponse.json({ error: "Already applied" }, { status: 400 });
    }

    job.applicants.push(user.uid);
    await job.save();

    return NextResponse.json({ job });
  } catch (err) {
    console.error("[POST /api/jobs/[id]/apply]", err);
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 });
  }
}
