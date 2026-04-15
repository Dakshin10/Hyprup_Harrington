import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/authMiddleware";
import JobModel from "@/models/Job";

// POST /api/jobs/[id]/pay
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
    // Business rule: cannot mark paid before job is completed
    if (job.status !== "completed") {
      return NextResponse.json({ error: "Cannot mark paid before job is completed" }, { status: 400 });
    }
    if (job.paymentStatus === "paid") {
      return NextResponse.json({ error: "Already marked as paid" }, { status: 400 });
    }

    job.paymentStatus = "paid";
    await job.save();

    return NextResponse.json({ job });
  } catch (err) {
    console.error("[POST /api/jobs/[id]/pay]", err);
    return NextResponse.json({ error: "Failed to mark payment" }, { status: 500 });
  }
}
