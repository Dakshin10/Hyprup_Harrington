import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/authMiddleware";
import BusinessProfileModel from "@/models/BusinessProfile";

// PUT /api/users/[uid]/business-profile
export async function PUT(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  const authResult = await verifyAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const { uid } = await params;

  if (user.uid !== uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, category, location } = body;

  try {
    await connectToDatabase();
    const updated = await BusinessProfileModel.findOneAndUpdate(
      { uid },
      { $set: { name, category, location } },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({ profile: updated });
  } catch (err) {
    console.error("[PUT /api/users/[uid]/business-profile]", err);
    return NextResponse.json({ error: "Failed to save business profile" }, { status: 500 });
  }
}
