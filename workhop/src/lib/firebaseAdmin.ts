/**
 * firebaseAdmin.ts
 *
 * Firebase Admin SDK is NO LONGER used for token verification.
 * Token verification now uses jose + Google's public JWKS endpoint (authMiddleware.ts).
 *
 * This file is kept as a shell in case Admin SDK operations are needed in future
 * (e.g. sending push notifications, managing users server-side).
 * 
 * All database operations use MongoDB via Mongoose.
 */

// Nothing to export for now — auth is handled by authMiddleware.ts
export {};
