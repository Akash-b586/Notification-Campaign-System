import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getNotificationLogs = async (req: any, res: any) => {
  try {
    const { campaignId, userId, status } = req.query;

    const logs = await prisma.notificationLog.findMany({
      where: {
        ...(campaignId && { campaignId }),
        ...(userId && { userId }),
        ...(status && { status: status.toUpperCase() }),
      },
      include: {
        campaign: {
          select: {
            campaignName: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
    });

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notification logs" });
  }
};
