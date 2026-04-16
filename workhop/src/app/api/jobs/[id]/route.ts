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

      // ❌ already full
      if (job.assignedUsers.length >= job.peopleRequired) {
        return NextResponse.json({ error: "Job is full" }, { status: 409 });
      }

      // ❌ already accepted by same student
      if (job.assignedUsers.includes(studentId)) {
        return NextResponse.json({ error: "Already joined" }, { status: 409 });
      }

      // ✅ add student
      job.assignedUsers.push(studentId);

      // 🔥 if full → update status
      if (job.assignedUsers.length >= job.peopleRequired) {
        job.status = "full";
      }

      await job.save();

      // Notify Business
      await Notification.create({
        userId: job.createdBy,
        jobId: job.jobId,
        message: `1 student joined your job "${job.title}"`,
        type: "assigned"
      });

      if (job.status === "full") {
        await Notification.create({
          userId: job.createdBy,
          jobId: job.jobId,
          message: `Your job "${job.title}" is fully booked`,
          type: "full"
        });
      }

      return NextResponse.json(job);
    }

    // 👤 STUDENT CANCELLATION LOGIC
    if (action === "student_cancel") {
      if (!studentId) return NextResponse.json({ error: "Student ID required" }, { status: 400 });
      const job = await Job.findOne({ jobId: id });
      if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

      job.assignedUsers = job.assignedUsers.filter((uid: string) => uid !== studentId);
      job.status = "open";
      await job.save();

      return NextResponse.json(job);
    }

    // ❌ BUSINESS CANCELLATION LOGIC
    if (action === "cancel") {
      const job = await Job.findOne({ jobId: id });
      if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

      const prevStudents = job.assignedUsers || [];
      job.status = "cancelled";
      await job.save();

      // Notify Students if any were assigned
      for (const student of prevStudents) {
        await Notification.create({
          userId: student,
          jobId: job.jobId,
          message: `The job "${job.title}" has been cancelled by the business.`,
          type: "cancelled"
        });
      }

      return NextResponse.json({ message: "Job cancelled", notifyUsers: prevStudents });
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
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const job = await Job.findOne({ jobId: id });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // 🔐 Ownership check
    if (job.createdBy !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 🔥 LOGIC: Delete if open, Cancel if assigned
    if (job.status === "open") {
      await Job.findOneAndDelete({ jobId: id });
      return NextResponse.json({ message: "Job deleted successfully", action: "deleted" });
    }

    if (job.status === "assigned" || job.status === "in-progress" || job.status === "full") {
      const prevStudents = job.assignedUsers || [];
      job.status = "cancelled";
      await job.save();

      // Notify Students
      for (const student of prevStudents) {
        await Notification.create({
          userId: student,
          jobId: job.jobId,
          message: `The job "${job.title}" has been cancelled by the business.`,
          type: "cancelled"
        });
      }

      return NextResponse.json({ 
        message: "Job cancelled and students notified", 
        action: "cancelled",
        notifyUsers: prevStudents 
      });
    }

    return NextResponse.json({ message: "Job is already completed or cancelled" });
  } catch (error: any) {
    console.error(`[API_JOB_DELETE] Error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
