import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/authMiddleware";
import JobModel from "@/models/Job";

// ─── GET /api/jobs/[id] ────────────────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await verifyAuth(req);
  if ("error" in authResult) return authResult.error;

  const { id } = await params;

  try {
    await connectToDatabase();
    const job = await JobModel.findOne({ jobId: id }).lean();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (err) {
    console.error("[GET /api/jobs/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}
