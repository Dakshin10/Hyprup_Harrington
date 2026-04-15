import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/authMiddleware";
import JobModel from "@/models/Job";
import JobTemplateModel from "@/models/JobTemplate";
import { nanoid } from "nanoid";

// ─── GET /api/jobs ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(req.url);
  const createdBy = searchParams.get("createdBy");
  const status = searchParams.get("status");
  const applicant = searchParams.get("applicant");
  const maxResults = parseInt(searchParams.get("limit") ?? "20");

  const filter: Record<string, unknown> = {};
  if (createdBy) filter.createdBy = createdBy;
  if (status) filter.status = status;
  if (applicant) filter.applicants = applicant;

  try {
    await connectToDatabase();
    const jobs = await JobModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(maxResults)
      .lean();

    return NextResponse.json({ jobs });
  } catch (err) {
    console.error("[GET /api/jobs]", err);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

// ─── POST /api/jobs ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const body = await req.json();
  const { title, description, payment, duration, location, isUrgent, jobType, slots, saveTemplate } = body;

  if (!title || !location) {
    return NextResponse.json({ error: "Title and location are required" }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const jobId = nanoid();

    const job = await JobModel.create({
      jobId,
      title,
      description: description || "",
      payment: Number(payment) || 150,
      duration: Number(duration) || 1,
      location,
      isUrgent: !!isUrgent,
      jobType: jobType || "instant",
      slots: Number(slots) || 1,
      createdBy: user.uid,
      applicants: [],
      selectedUser: null,
      status: "open",
      createdAt: Date.now(),
    });

    // Save as template if requested
    if (saveTemplate) {
      await JobTemplateModel.create({
        title,
        description: description || "",
        payment: Number(payment),
        duration: Number(duration),
        location,
        isUrgent: !!isUrgent,
        jobType: jobType || "instant",
        slots: Number(slots) || 1,
        createdBy: user.uid,
        createdAt: Date.now(),
      });
    }

    return NextResponse.json({ job }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/jobs]", err);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
