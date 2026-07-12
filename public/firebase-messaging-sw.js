/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js",
);

// 주의: 이 값들은 클라이언트에 원래 공개되는 값들이라 여기 직접 적어도 괜찮습니다.
firebase.initializeApp({
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY_여기에_실제값_붙여넣기",
  authDomain: "dalant-flex.firebaseapp.com",
  projectId: "dalant-flex",
  storageBucket: "dalant-flex.firebasestorage.app",
  messagingSenderId: "365690166614",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID_여기에_실제값_붙여넣기",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "달란트플렉스";
  const body = payload.notification?.body || "";
  self.registration.showNotification(title, {
    body,
    icon: "/icon-192.png",
  });
});
