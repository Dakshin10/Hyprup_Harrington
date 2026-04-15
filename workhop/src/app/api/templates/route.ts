import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/authMiddleware";
import JobTemplateModel from "@/models/JobTemplate";

// ─── GET /api/templates ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  try {
    await connectToDatabase();
    const templates = await JobTemplateModel.find({ createdBy: user.uid })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ templates });
  } catch (err) {
    console.error("[GET /api/templates]", err);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

// ─── POST /api/templates ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const body = await req.json();
  const { title, description, payment, duration, location, isUrgent, jobType, slots } = body;

  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  try {
    await connectToDatabase();
    const template = await JobTemplateModel.create({
      title,
      description: description || "",
      payment: Number(payment) || 150,
      duration: Number(duration) || 1,
      location: location || "",
      isUrgent: !!isUrgent,
      jobType: jobType || "instant",
      slots: Number(slots) || 1,
      createdBy: user.uid,
      createdAt: Date.now(),
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/templates]", err);
    return NextResponse.json({ error: "Failed to save template" }, { status: 500 });
  }
}
