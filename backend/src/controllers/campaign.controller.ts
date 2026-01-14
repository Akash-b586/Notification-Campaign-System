import prisma from "../config/prisma";
import { scheduleSend } from "../utils/scheduleSend";

export const createCampaign = async (req: any, res: any) => {
  try {
    const { campaignName, notificationType, cityFilter} = req.body;

    if (!campaignName || !notificationType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Enforce that campaigns are for OFFERS only
    const normalizedType = notificationType.toUpperCase().replace(/-/g, '_');
    if (normalizedType !== 'OFFERS') {
      return res.status(400).json({ message: "Campaigns can only be used for OFFERS" });
    }

    const campaign = await prisma.campaign.create({
      data: {
        campaignName,
        notificationType: normalizedType,
        cityFilter,
        createdById: req.user?.userId!,
        status: "DRAFT",
      },
    });

    return res.status(201).json({
      campaignId: campaign.id,
      status: campaign.status,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create campaign" });
  }
};

export const previewCampaign = async (req: any, res: any) => {
  try {
    const campaignId = req.params.id;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Get users that are eligible based on city filter and notification preferences
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        ...(campaign.cityFilter && { city: campaign.cityFilter }),
        preferences: {
          some: {
            notificationType: 'OFFERS',
            // At least one channel is enabled
            OR: [
              { email: true },
              { sms: true },
              { push: true }
            ]
          }
        }
      },
      select: {
        userId: true,
        email: true,
        city: true,
        phone: true,
        name: true,
      },
    });

    return res.json({
      totalEligibleUsers: users.length,
      users,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to preview campaign" });
  }
};

export const sendCampaign = async (req: any, res: any) => {
  try {
    const campaignId = req.params.id;
    const {scheduledAt} = req.body;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.status === "SENT") {
      return res.status(400).json({ message: "Campaign already sent" });
    }

    let delay = 0;
    let status : "SENT" | "SCHEDULED" = "SENT";

    // Schedule the campaign send if scheduleAt is provided
    if (scheduledAt) {
      delay = new Date(scheduledAt).getTime() - new Date().getTime();
      if (delay <= 0) {
        return res.status(400).json({
          message: "scheduledAt must be in the future",
        });
      }

      status = "SCHEDULED";
    }

    await scheduleSend({ campaignId }, delay);

    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status,
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
      },
    });

    return res.json({
      message:
        delay > 0
          ? "Campaign scheduled successfully"
          : "Campaign sent successfully",
      scheduledAt: scheduledAt || null,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to send campaign" });
  }
};

export const listCampaigns = async (req: any, res: any) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: {
            userId: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return res.json(campaigns);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch campaigns" });
  }
};

export const getCampaign = async (req: any, res: any) => {
  try {
    const campaignId = req.params.id;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        createdBy: {
          select: {
            userId: true,
            name: true,
            email: true,
          }
        },
        recipients: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    return res.json(campaign);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch campaign" });
  }
};

export const getCampaignRecipients = async (req: any, res: any) => {
  try {
    const campaignId = req.params.id;
    const recipients = await prisma.campaignRecipient.findMany({
      where: { campaignId },
      include: { user: true },
    });
    return res.json({ recipients });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to get campaign recipients" });
  }
};

export const updateCampaign = async (req: any, res: any) => {
  try {
    const campaignId = req.params.id;
    const { campaignName, cityFilter } = req.body;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.status === "SENT") {
      return res.status(400).json({
        message: "Sent campaigns cannot be updated",
      });
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        ...(campaignName && { campaignName }),
        ...(cityFilter !== undefined && { cityFilter }),
      },
    });

    return res.json({
      message: "Campaign updated successfully",
      campaign: updatedCampaign,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update campaign" });
  }
};