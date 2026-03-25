type PushSubscriptionRecord = {
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
};

export function toWebPushSubscription(record: PushSubscriptionRecord) {
  return {
    endpoint: record.endpoint,
    keys: {
      p256dh: record.p256dh_key,
      auth: record.auth_key,
    },
  };
}