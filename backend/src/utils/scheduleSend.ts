import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

import prisma from "../config/prisma";

// Create a Redis connection instance
const connection = new IORedis({ maxRetriesPerRequest: null });

export const sendQueue = new Queue("sendQueue", { connection });
export const newsletterQueue = new Queue("newsletterQueue", { connection });

export const scheduleSend = async (
  data: { campaignId: string },
  delay: number
) => {
  await sendQueue.add("sendCampaign", data, {
    delay,
  });
};

export const scheduleNewsletterPublish = async (
  data: { newsletterId: string },
  delay = 0
) => {
  await newsletterQueue.add("publishNewsletter", data, {
    delay,
  });
};


new Worker(
  "sendQueue",
  async (job) => {
    // Get eligible users based on city filter and OFFERS notification preferences
    const { campaignId } = job.data;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        ...(campaign?.cityFilter && { city: campaign?.cityFilter }),
      },
      select: {
        userId: true,
        preferences: {
          where: {
            notificationType: "OFFERS",
          },
          select: {
            email: true,
            sms: true,
            push: true,
          },
        },
      },
    });

    if (users.length === 0) {
      console.log(`No eligible users found for campaign ${campaignId}`);
      return;
    }

    // Prepare recipient data
    const recipientData = users.map((u) => ({
      campaignId,
      userId: u.userId,
    }));

    // Prepare notification log entries
    // For each user, create one log entry per enabled channel
    const logData: any[] = [];
    const channels = ["EMAIL", "SMS", "PUSH"] as const;

    for (const user of users) {
      const prefs = user.preferences[0]; // Should only be one OFFERS preference

      if (!prefs) {
        // No preference exists, treat as opt-in by default
        for (const channel of channels) {
          logData.push({
            userId: user.userId,
            notificationType: "OFFERS",
            channel,
            status: "SUCCESS",
            campaignId,
          });
        }
      } else {
        // Create log for each enabled channel
        if (prefs.email) {
          logData.push({
            userId: user.userId,
            notificationType: "OFFERS",
            channel: "EMAIL",
            status: "SUCCESS",
            campaignId,
          });
        }
        if (prefs.sms) {
          logData.push({
            userId: user.userId,
            notificationType: "OFFERS",
            channel: "SMS",
            status: "SUCCESS",
            campaignId,
          });
        }
        if (prefs.push) {
          logData.push({
            userId: user.userId,
            notificationType: "OFFERS",
            channel: "PUSH",
            status: "SUCCESS",
            campaignId,
          });
        }
      }
    }

    await prisma.$transaction([
      prisma.campaignRecipient.createMany({
        data: recipientData,
        skipDuplicates: true,
      }),
      prisma.notificationLog.createMany({
        data: logData,
      }),
      prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "SENT" },
      }),
    ]);

    console.log(`Processed campaign ${campaignId} for ${users.length} users.`);
  },
  { connection }
);


new Worker(
  "newsletterQueue",
  async job => {
    const { newsletterId } = job.data;

    const newsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId },
      include: {
        subscriptions: {
          select: {
            userId: true,
            email: true,
            sms: true,
            push: true,
          },
        },
      },
    });

    if (!newsletter || !newsletter.isActive) return;

    if (newsletter.subscriptions.length === 0) {
      console.log(`Newsletter ${newsletterId} has no subscribers`);
      return;
    }

    const logData: any[] = [];
    const channels = ["EMAIL", "SMS", "PUSH"] as const;

    for (const sub of newsletter.subscriptions) {
      for (const channel of channels) {
        if (sub[channel.toLowerCase() as keyof typeof sub]) {
          logData.push({
            userId: sub.userId,
            notificationType: "NEWSLETTER",
            channel,
            status: "SUCCESS",
            newsletterId,
          });
        }
      }
    }

    if (logData.length) {
      await prisma.notificationLog.createMany({ data: logData });
    }

    console.log(
      `Published newsletter ${newsletterId} to ${newsletter.subscriptions.length} subscribers`
    );
  },
  { connection }
);
