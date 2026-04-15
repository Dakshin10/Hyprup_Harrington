import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/authMiddleware";
import JobModel from "@/models/Job";
import { nanoid } from "nanoid";

// POST /api/jobs/[id]/repost
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await verifyAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const { id } = await params;

  try {
    await connectToDatabase();
    const original = await JobModel.findOne({ jobId: id }).lean();

    if (!original) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (original.createdBy !== user.uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const newJobId = nanoid();
    const newJob = await JobModel.create({
      jobId: newJobId,
      title: original.title,
      description: original.description,
      payment: original.payment,
      duration: original.duration,
      location: original.location,
      isUrgent: original.isUrgent,
      jobType: original.jobType,
      slots: original.slots,
      createdBy: user.uid,
      applicants: [],
      selectedUser: null,
      status: "open",
      createdAt: Date.now(),
    });

    return NextResponse.json({ job: newJob }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/jobs/[id]/repost]", err);
    return NextResponse.json({ error: "Failed to repost job" }, { status: 500 });
  }
}
