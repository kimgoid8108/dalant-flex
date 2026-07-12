import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { app } from "@/lib/firebase";

const PUSH_TOKENS_COLLECTION = "pushTokens";

export async function registerForPushNotifications(): Promise<
  "granted" | "denied" | "unsupported" | "error"
> {
  try {
    const supported = await isSupported();
    if (!supported) return "unsupported";

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return "denied";

    await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const registration = await navigator.serviceWorker.ready;

    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) return "error";

    // 이미 저장된 토큰이면 중복 저장하지 않는다
    const existing = await getDocs(
      query(
        collection(db, PUSH_TOKENS_COLLECTION),
        where("token", "==", token),
      ),
    );
    if (existing.empty) {
      await addDoc(collection(db, PUSH_TOKENS_COLLECTION), {
        token,
        createdAt: Date.now(),
      });
    }

    return "granted";
  } catch (err) {
    console.error("푸시 알림 등록 실패", err);
    return "error";
  }
}
