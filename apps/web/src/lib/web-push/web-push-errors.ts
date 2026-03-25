type PushErrorLike = {
  statusCode?: number;
  body?: unknown;
  message?: string;
};

export function getPushStatusCode(error: unknown): number | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof (error as PushErrorLike).statusCode === "number"
  ) {
    return (error as PushErrorLike).statusCode ?? null;
  }

  return null;
}

export function isExpiredPushSubscriptionError(error: unknown): boolean {
  const statusCode = getPushStatusCode(error);
  return statusCode === 404 || statusCode === 410;
}