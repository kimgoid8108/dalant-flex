import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { getFirestore } from "firebase-admin/firestore";

// 이 파일은 서버(API 라우트)에서만 import 해야 한다. 클라이언트 번들에 포함되면 안 된다.
function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const privateKey = Buffer.from(
    process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64 || "",
    "base64",
  ).toString("utf8");

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

const app = getAdminApp();

export const adminMessaging = getMessaging(app);
export const adminDb = getFirestore(app);
