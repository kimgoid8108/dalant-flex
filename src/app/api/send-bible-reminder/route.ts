import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminMessaging } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** 서버가 어느 타임존에서 돌아가든 정확한 KST(한국 시간) 값을 뽑아낸다 */
function getKstNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date());

  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;

  const dayOfWeek = WEEKDAY_NAMES.indexOf(map.weekday);
  let hour = parseInt(map.hour, 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(map.minute, 10);
  const dateKey = `${map.year}-${map.month}-${map.day}`;

  return { dayOfWeek, hour, minute, dateKey };
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

  const kst = getKstNow();

  const matchesSchedule =
    kst.dayOfWeek === settings.dayOfWeek &&
    kst.hour === settings.hour &&
    kst.minute === settings.minute;

  if (!matchesSchedule) {
    return NextResponse.json({
      skipped: "not scheduled time",
      debug: { now: kst, expected: settings },
    });
  }

  if (settings.lastSentDate === kst.dateKey) {
    return NextResponse.json({ skipped: "already sent today" });
  }

  // 저장된 모든 푸시 토큰 가져오기
  const tokensSnap = await adminDb.collection("pushTokens").get();
  const tokens = tokensSnap.docs
    .map((d) => d.data().token as string)
    .filter(Boolean);

  if (tokens.length === 0) {
    await settingsRef.set({ lastSentDate: kst.dateKey }, { merge: true });
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

  await settingsRef.set({ lastSentDate: kst.dateKey }, { merge: true });

  return NextResponse.json({
    sent: response.successCount,
    failed: response.failureCount,
  });
}
