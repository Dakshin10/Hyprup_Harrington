import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Job from "@/models/Job";
import Notification from "@/models/Notification";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const job = await Job.findOne({ jobId: id });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error: any) {
    console.error(`[API_JOB_GET] Error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { action, studentId, ...rest } = body;

    // 🚨 ATOMIC LOCKING LOGIC for students accepting a job
    if (action === "accept") {
      if (!studentId) return NextResponse.json({ error: "Student ID required" }, { status: 400 });

      // Find job and verify it's still open
      const job = await Job.findOne({ jobId: id });
      if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

      if (job.status !== "open") {
        return NextResponse.json({ error: "Job already taken or closed" }, { status: 409 });
      }

      // Lock it
      job.status = "assigned";
      job.selectedUser = studentId;
      job.confirmed = true; // Auto-confirm on accept for this lifecycle
      await job.save();

      // Notify Business
      await Notification.create({
        userId: job.createdBy,
        jobId: job.jobId,
        message: `Your job "${job.title}" has been accepted by a student!`,
        type: "assigned"
      });

      return NextResponse.json(job);
    }

    // ❌ CANCELLATION LOGIC
    if (action === "cancel") {
      const job = await Job.findOne({ jobId: id });
      if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

      const prevStudent = job.selectedUser;
      job.status = "cancelled";
      await job.save();

      // Notify Student if one was assigned
      if (prevStudent) {
        await Notification.create({
          userId: prevStudent,
          jobId: job.jobId,
          message: `The job "${job.title}" has been cancelled by the business.`,
          type: "cancelled"
        });
      }

      return NextResponse.json({ message: "Job cancelled", notifyUser: prevStudent });
    }

    // Standard update
    const updatedJob = await Job.findOneAndUpdate(
      { jobId: id },
      { $set: rest },
      { new: true }
    );

    if (!updatedJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(updatedJob);
  } catch (error: any) {
    console.error(`[API_JOB_PATCH] Error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const job = await Job.findOneAndDelete({ jobId: id });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`[API_JOB_DELETE] Error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
