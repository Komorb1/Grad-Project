"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  useState,
  type ReactNode,
} from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type ClientInfo = {
  isIOS: boolean;
  isAndroid: boolean;
  isStandalone: boolean;
};

type PWAInstallContextValue = ClientInfo & {
  isHydrated: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  clearPrompt: () => void;
};

const PWAInstallContext = createContext<PWAInstallContextValue | null>(null);

function getClientInfo(): ClientInfo {
  const ua = window.navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  return { isIOS, isAndroid, isStandalone };
}

// Hydration flag without setState-in-effect
function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

// Client info snapshot without effect-time state initialization
function useClientInfo(isHydrated: boolean): ClientInfo {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (!isHydrated || typeof window === "undefined") {
        return () => {};
      }

      const media = window.matchMedia("(display-mode: standalone)");

      const handleChange = () => onStoreChange();

      window.addEventListener("focus", handleChange);
      window.addEventListener("resize", handleChange);
      document.addEventListener("visibilitychange", handleChange);

      // Safari fallback support
      if (typeof media.addEventListener === "function") {
        media.addEventListener("change", handleChange);
      } else if (typeof media.addListener === "function") {
        media.addListener(handleChange);
      }

      return () => {
        window.removeEventListener("focus", handleChange);
        window.removeEventListener("resize", handleChange);
        document.removeEventListener("visibilitychange", handleChange);

        if (typeof media.removeEventListener === "function") {
          media.removeEventListener("change", handleChange);
        } else if (typeof media.removeListener === "function") {
          media.removeListener(handleChange);
        }
      };
    },
    () => (isHydrated ? getClientInfo() : { isIOS: false, isAndroid: false, isStandalone: false }),
    () => ({ isIOS: false, isAndroid: false, isStandalone: false })
  );
}

export function PWAInstallProvider({ children }: { children: ReactNode }) {
  const isHydrated = useHydrated();
  const clientInfo = useClientInfo(isHydrated);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return (
    <PWAInstallContext.Provider
      value={{
        isHydrated,
        deferredPrompt,
        clearPrompt: () => setDeferredPrompt(null),
        ...clientInfo,
      }}
    >
      {children}
    </PWAInstallContext.Provider>
  );
}

export function usePWAInstall() {
  const context = useContext(PWAInstallContext);

  if (!context) {
    throw new Error("usePWAInstall must be used within PWAInstallProvider");
  }

  return context;
}