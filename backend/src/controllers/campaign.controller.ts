import prisma from "../config/prisma";

export const createCampaign = async (req: any, res: any) => {
  try {
    const { campaignName, notificationType, cityFilter } = req.body;

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

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.status === "SENT") {
      return res.status(400).json({ message: "Campaign already sent" });
    }

    // Get eligible users based on city filter and OFFERS notification preferences
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        ...(campaign.cityFilter && { city: campaign.cityFilter }),
      },
      select: { 
        userId: true,
        preferences: {
          where: {
            notificationType: 'OFFERS'
          },
          select: {
            email: true,
            sms: true,
            push: true
          }
        }
      },
    });

    if (users.length === 0) {
      return res.status(200).json({
        message: "No eligible users found",
        sentCount: 0,
      });
    }

    // Prepare recipient data
    const recipientData = users.map((u) => ({
      campaignId,
      userId: u.userId,
    }));

    // Prepare notification log entries
    // For each user, create one log entry per enabled channel
    const logData: any[] = [];
    const channels = ['EMAIL', 'SMS', 'PUSH'] as const;

    for (const user of users) {
      const prefs = user.preferences[0]; // Should only be one OFFERS preference
      
      if (!prefs) {
        // No preference exists, treat as opt-in by default
        for (const channel of channels) {
          logData.push({
            userId: user.userId,
            notificationType: 'OFFERS',
            channel,
            status: 'SUCCESS',
            campaignId,
          });
        }
      } else {
        // Create log for each enabled channel
        if (prefs.email) {
          logData.push({
            userId: user.userId,
            notificationType: 'OFFERS',
            channel: 'EMAIL',
            status: 'SUCCESS',
            campaignId,
          });
        }
        if (prefs.sms) {
          logData.push({
            userId: user.userId,
            notificationType: 'OFFERS',
            channel: 'SMS',
            status: 'SUCCESS',
            campaignId,
          });
        }
        if (prefs.push) {
          logData.push({
            userId: user.userId,
            notificationType: 'OFFERS',
            channel: 'PUSH',
            status: 'SUCCESS',
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

    return res.json({
      message: "Campaign sent successfully",
      sentCount: users.length,
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