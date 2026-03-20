import { prisma } from "@/lib/prisma";

type CreateAlertNotificationsInput = {
  eventId: string;
  siteId: string;
};

export async function createAlertNotificationsForEvent(
  input: CreateAlertNotificationsInput
) {
  const siteUsers = await prisma.siteUser.findMany({
    where: { site_id: input.siteId },
    select: { user_id: true },
  });

  if (siteUsers.length === 0) {
    return { created: 0 };
  }

  let created = 0;

  for (const siteUser of siteUsers) {
    const exists = await prisma.alertNotification.findFirst({
      where: {
        event_id: input.eventId,
        recipient_user_id: siteUser.user_id,
        channel: "web_push",
      },
      select: { alert_id: true },
    });

    if (exists) {
      continue;
    }

    await prisma.alertNotification.create({
      data: {
        event_id: input.eventId,
        recipient_user_id: siteUser.user_id,
        channel: "web_push",
        status: "queued",
      },
    });

    created += 1;
  }

  return { created };
}