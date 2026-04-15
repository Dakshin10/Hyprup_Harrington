import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/authMiddleware";
import JobModel from "@/models/Job";

// POST /api/jobs/[id]/checkin
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await verifyAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const { id } = await params;

  try {
    await connectToDatabase();
    const job = await JobModel.findOne({ jobId: id });

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.selectedUser !== user.uid) {
      return NextResponse.json({ error: "Only the selected worker can check in" }, { status: 403 });
    }
    if (!job.confirmed) {
      return NextResponse.json({ error: "Must confirm before checking in" }, { status: 400 });
    }

    job.checkIn = true;
    job.checkInAt = Date.now();
    job.status = "in-progress";
    await job.save();

    return NextResponse.json({ job });
  } catch (err) {
    console.error("[POST /api/jobs/[id]/checkin]", err);
    return NextResponse.json({ error: "Failed to check in" }, { status: 500 });
  }
}
