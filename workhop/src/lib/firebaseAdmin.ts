import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  // If we have credentials in the env variables, initialize with them
  // Otherwise it might fall back to application default credentials in a deployed environment
  const credentialConfig = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
    ? {
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Replace escaped newlines so the key works correctly from .env files
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
      }
    : undefined;

  initializeApp(credentialConfig);
}

// Get the default app instance
export const adminDb = getFirestore(getApp());
