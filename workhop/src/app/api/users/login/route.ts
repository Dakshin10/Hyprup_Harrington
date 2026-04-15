import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/authMiddleware";
import UserModel from "@/models/User";

// POST /api/users/login
// Called after every Firebase Auth sign-in to upsert the user in MongoDB
export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const body = await req.json();
  const { email, uiRole } = body;

  if (!uiRole || !["student", "business"].includes(uiRole)) {
    return NextResponse.json({ error: "Valid uiRole required (student|business)" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    let dbUser = await UserModel.findOne({ uid: user.uid });

    if (dbUser) {
      // User exists — return their stored role (ignore uiRole)
      if (dbUser.role !== "student" && dbUser.role !== "business") {
        dbUser.role = "student"; // corrupted data fallback
        await dbUser.save();
      }
      return NextResponse.json({ user: dbUser, role: dbUser.role });
    }

    // New user — create with chosen role
    dbUser = await UserModel.create({
      uid: user.uid,
      email: email || user.email || "anonymous@workhop.local",
      role: uiRole,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ user: dbUser, role: dbUser.role }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/users/login]", err);
    return NextResponse.json({ error: "Failed to establish user profile" }, { status: 500 });
  }
}
