import webpush from "web-push";
import {
  WEB_PUSH_CONTACT_EMAIL,
  WEB_PUSH_VAPID_PRIVATE_KEY,
  WEB_PUSH_VAPID_PUBLIC_KEY,
} from "@/lib/web-push/env-web-push";

let configured = false;

function ensureWebPushConfigured() {
  if (configured) return;

  webpush.setVapidDetails(
    WEB_PUSH_CONTACT_EMAIL,
    WEB_PUSH_VAPID_PUBLIC_KEY,
    WEB_PUSH_VAPID_PRIVATE_KEY
  );

  configured = true;
}

export type WebPushSubscription = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export type AlertPushPayload = {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    url?: string;
    alertId?: string;
    eventId?: string;
    siteId?: string;
    deviceId?: string;
    severity?: string;
    eventType?: string;
    timestamp?: string;
  };
};

export async function sendWebPushNotification(
  subscription: WebPushSubscription,
  payload: AlertPushPayload
) {
  ensureWebPushConfigured();

  return webpush.sendNotification(subscription, JSON.stringify(payload));
}

export function getWebPushPublicKey(): string {
  return WEB_PUSH_VAPID_PUBLIC_KEY;
}