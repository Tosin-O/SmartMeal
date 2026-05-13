// lib/firebase-admin.ts
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

/**
 * Function to assign admin privileges
 */
export const setAdminClaim = async (uid: string) => {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Successfully assigned admin claim to user: ${uid}`);
  } catch (error) {
    console.error('Error setting custom claims:', error);
  }
};

// --- ONE-TIME EXECUTION FOR YOUR SPECIFIC UID ---
// You can remove this block after you run the script once.
const TARGET_UID = 'viDKGHZXBRSvaSr5aUVMTpQ9Dcv2';
setAdminClaim(TARGET_UID);