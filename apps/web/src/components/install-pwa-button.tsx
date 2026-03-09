"use client";

import { useEffect, useState } from "react";
import { Download, Share2, Smartphone } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    const android = /android/i.test(ua);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;

    setIsIOS(ios);
    setIsAndroid(android);
    setIsStandalone(standalone);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    const timer = window.setTimeout(() => {
      setIsReady(true);
    }, 1200);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.clearTimeout(timer);
    };
  }, []);

  if (!isReady || isStandalone) return null;

  if (deferredPrompt) {
    return (
      <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/80 p-3 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-blue-600/10 p-2 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Download className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Install SEAS
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                Add SEAS to your device for faster access and a more app-like experience.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              await deferredPrompt.prompt();
              setDeferredPrompt(null);
            }}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <Download className="h-4 w-4" />
            Install
          </button>
        </div>
      </div>
    );
  }

  if (isIOS) {
    return (
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Share2 className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Install SEAS on iPhone
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
              Tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isAndroid) {
    return (
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Smartphone className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Install SEAS on Android
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
              Open the browser menu and look for <strong>Install app</strong> or{" "}
              <strong>Add to Home screen</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}