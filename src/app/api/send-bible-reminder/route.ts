import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminMessaging } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const settingsRef = adminDb.collection("settings").doc("bibleReminder");
  const snap = await settingsRef.get();

  if (!snap.exists) {
    return NextResponse.json({ skipped: "no settings" });
  }

  const settings = snap.data() as {
    enabled: boolean;
    dayOfWeek: number;
    hour: number;
    minute: number;
    message: string;
    lastSentDate?: string;
  };

  if (!settings.enabled) {
    return NextResponse.json({ skipped: "disabled" });
  }

  // KST(한국 시간) 기준으로 현재 시각 계산
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }),
  );

  const matchesSchedule =
    now.getDay() === settings.dayOfWeek &&
    now.getHours() === settings.hour &&
    now.getMinutes() === settings.minute;

  if (!matchesSchedule) {
    return NextResponse.json({ skipped: "not scheduled time" });
  }

  const todayKey = toDateKey(now);
  if (settings.lastSentDate === todayKey) {
    return NextResponse.json({ skipped: "already sent today" });
  }

  // 저장된 모든 푸시 토큰 가져오기
  const tokensSnap = await adminDb.collection("pushTokens").get();
  const tokens = tokensSnap.docs
    .map((d) => d.data().token as string)
    .filter(Boolean);

  if (tokens.length === 0) {
    await settingsRef.set({ lastSentDate: todayKey }, { merge: true });
    return NextResponse.json({ sent: 0, note: "no tokens registered" });
  }

  const response = await adminMessaging.sendEachForMulticast({
    tokens,
    notification: {
      title: "달란트플렉스",
      body: settings.message,
    },
    webpush: {
      fcmOptions: {
        link: `${process.env.APP_URL}/staff/bible-qr`,
      },
    },
  });

  await settingsRef.set({ lastSentDate: todayKey }, { merge: true });

  return NextResponse.json({
    sent: response.successCount,
    failed: response.failureCount,
  });
}
