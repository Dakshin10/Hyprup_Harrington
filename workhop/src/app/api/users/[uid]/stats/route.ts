import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/authMiddleware";
import JobModel from "@/models/Job";

// GET /api/users/[uid]/stats
export async function GET(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  const authResult = await verifyAuth(req);
  if ("error" in authResult) return authResult.error;

  const { uid } = await params;

  try {
    await connectToDatabase();
    const jobs = await JobModel.find({ createdBy: uid }).lean();

    const stats = {
      jobs: jobs.length,
      completed: jobs.filter((j) => j.status === "completed").length,
      repeat: jobs.filter((j) => (j as any).repeatHire).length,
    };

    return NextResponse.json({ stats });
  } catch (err) {
    console.error("[GET /api/users/[uid]/stats]", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
