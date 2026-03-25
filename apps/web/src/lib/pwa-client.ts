export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;

  const isDisplayModeStandalone = window.matchMedia?.(
    "(display-mode: standalone)"
  ).matches;

  const isIosStandalone =
    "standalone" in window.navigator &&
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

  return isDisplayModeStandalone || isIosStandalone;
}