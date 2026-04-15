import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/authMiddleware";
import UserModel from "@/models/User";
import BusinessProfileModel from "@/models/BusinessProfile";

// ─── GET /api/users/[uid] ──────────────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  const authResult = await verifyAuth(req);
  if ("error" in authResult) return authResult.error;

  const { uid } = await params;
  const { searchParams } = new URL(req.url);
  const includeBusinessProfile = searchParams.get("includeBusinessProfile") === "true";

  try {
    await connectToDatabase();
    const user = await UserModel.findOne({ uid }).lean();

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let merged: Record<string, unknown> = { ...user };

    if (includeBusinessProfile) {
      const bizProfile = await BusinessProfileModel.findOne({ uid }).lean();
      if (bizProfile) {
        merged = { ...merged, ...bizProfile };
      }
    }

    return NextResponse.json({ user: merged });
  } catch (err) {
    console.error("[GET /api/users/[uid]]", err);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// ─── PATCH /api/users/[uid] ────────────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  const authResult = await verifyAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user: caller } = authResult;

  const { uid } = await params;

  // Users can only update themselves
  if (caller.uid !== uid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  // Whitelist updatable fields
  const { name, available, skills } = body;
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (available !== undefined) updates.available = available;
  if (skills !== undefined) updates.skills = skills;

  try {
    await connectToDatabase();
    const updated = await UserModel.findOneAndUpdate(
      { uid },
      { $set: updates },
      { new: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error("[PATCH /api/users/[uid]]", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
