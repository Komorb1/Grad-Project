"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import {
  isPushSupported,
  subscribeBrowserToPush,
  unsubscribeBrowserFromPush,
} from "@/lib/web-push/push-client";
import { isStandalonePwa } from "@/lib/pwa-client";

type PermissionState = "unsupported" | "default" | "granted" | "denied";

export function PushNotificationButton() {
  const [hasMounted, setHasMounted] = useState(false);
  const [supported, setSupported] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [permission, setPermission] = useState<PermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    const pushSupported = isPushSupported();
    setSupported(pushSupported);

    if (!pushSupported) {
      setPermission("unsupported");
      return;
    }

    setInstalled(isStandalonePwa());
    setPermission(Notification.permission as PermissionState);

    navigator.serviceWorker
      .getRegistration("/sw.js")
      .then((registration) => {
        if (!registration) return null;
        return registration.pushManager.getSubscription();
      })
      .then((subscription) => {
        setIsSubscribed(Boolean(subscription));
      })
      .catch(() => {
        setIsSubscribed(false);
      });
  }, []);

  if (!hasMounted || !supported) {
    return null;
  }

  const enabled = permission === "granted" && isSubscribed;

  async function handleClick() {
    if (!installed) return;

    setIsBusy(true);

    try {
      if (enabled) {
        await unsubscribeBrowserFromPush();
        setIsSubscribed(false);
        return;
      }

      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);

      if (result !== "granted") return;

      await subscribeBrowserToPush(null);
      setIsSubscribed(true);
    } catch (error) {
      console.error("Push notification toggle error:", error);
    } finally {
      setIsBusy(false);
    }
  }

  const title = !installed
    ? "Install the app to enable notifications"
    : permission === "denied"
      ? "Notifications blocked in browser settings"
      : enabled
        ? "Disable critical alert notifications"
        : "Enable critical alert notifications";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isBusy || permission === "denied" || !installed}
      title={title}
      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {isBusy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : enabled ? (
        <Bell className="h-5 w-5" />
      ) : (
        <BellOff className="h-5 w-5" />
      )}
    </button>
  );
}