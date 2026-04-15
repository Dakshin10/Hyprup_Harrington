/**
 * authMiddleware.ts
 *
 * Verifies Firebase ID tokens WITHOUT requiring Firebase Admin SDK credentials
 * or Application Default Credentials.
 *
 * How it works:
 *  1. Firebase ID tokens are standard RS256-signed JWTs
 *  2. Google publishes the signing public keys at a known JWKS endpoint
 *  3. We use the `jose` library to fetch those keys and verify the token locally
 *  4. No service account, no ADC, no GCLOUD_PROJECT env var needed
 */

import { NextRequest, NextResponse } from "next/server";
import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";
import { connectToDatabase } from "./mongodb";
import UserModel from "@/models/User";

// ─── Firebase public JWKS endpoint ────────────────────────────────────────────
// Keys are cached automatically by jose and refreshed when a new `kid` appears
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

const PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DecodedUser {
  uid: string;
  email: string | undefined;
}

// ─── Core token verifier ──────────────────────────────────────────────────────
/**
 * Verifies a Firebase ID token using Google's public JWKS.
 * Returns the decoded payload or throws.
 */
async function verifyFirebaseToken(token: string): Promise<JWTPayload & { uid: string }> {
  const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${PROJECT_ID}`,
    audience: PROJECT_ID,
  });

  const uid = payload.sub;
  if (!uid) throw new Error("Token missing 'sub' (uid) claim");

  return { ...payload, uid };
}

// ─── verifyAuth ───────────────────────────────────────────────────────────────
/**
 * Verifies the Firebase ID token from `Authorization: Bearer <token>`.
 * No service-account credentials required.
 */
export async function verifyAuth(
  req: NextRequest
): Promise<{ user: DecodedUser } | { error: NextResponse }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized: missing token" },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyFirebaseToken(token);
    return {
      user: {
        uid: payload.uid,
        email: payload.email as string | undefined,
      },
    };
  } catch (err) {
    console.error("[authMiddleware] Token verification failed:", err);
    return {
      error: NextResponse.json(
        { error: "Unauthorized: invalid token" },
        { status: 401 }
      ),
    };
  }
}

// ─── verifyRole ───────────────────────────────────────────────────────────────
/**
 * Verifies the token AND checks the user's role in MongoDB.
 */
export async function verifyRole(
  req: NextRequest,
  allowedRoles: ("student" | "business")[]
): Promise<{ user: DecodedUser & { role: string } } | { error: NextResponse }> {
  const authResult = await verifyAuth(req);
  if ("error" in authResult) return authResult;

  const { user } = authResult;

  await connectToDatabase();
  const dbUser = await UserModel.findOne({ uid: user.uid }).lean();

  if (!dbUser) {
    return {
      error: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }

  if (!allowedRoles.includes(dbUser.role as "student" | "business")) {
    return {
      error: NextResponse.json(
        { error: "Forbidden: insufficient role" },
        { status: 403 }
      ),
    };
  }

  return { user: { ...user, role: dbUser.role as string } };
}
