import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Job from "@/models/Job";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // Ensure atomic defaults if not provided
    if (!body.jobId) {
      body.jobId = `job-${Date.now()}`;
    }

    const job = await Job.create({
      ...body,
      status: "open",
      createdAt: Date.now(),
    });

    return NextResponse.json(job);
  } catch (error: any) {
    console.error("API POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    
    const createdBy = searchParams.get("createdBy");
    const status = searchParams.get("status");
    const applicant = searchParams.get("applicant");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query: any = {};
    if (createdBy) query.createdBy = createdBy;
    if (status) query.status = status;
    if (applicant) query.applicants = { $in: [applicant] };

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
