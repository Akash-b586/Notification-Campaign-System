import prisma from "../config/prisma";

export const createCampaign = async (req: any, res: any) => {
  try {
    const { campaignName, notificationType, cityFilter } = req.body;

    if (!campaignName || !notificationType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const campaign = await prisma.campaign.create({
      data: {
        campaignName,
        notificationType,
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

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        ...(campaign.cityFilter && { city: campaign.cityFilter }),
        preference: {
          [campaign.notificationType.toLowerCase()]: true,
        },
      },
      select: {
        userId: true,
        email: true,
        city: true,
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

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        ...(campaign.cityFilter && { city: campaign.cityFilter }),
        preference: {
          [campaign.notificationType.toLowerCase()]: true,
        },
      },
      select: { userId: true },
    });

    
    if (users.length === 0) {
      return res.status(200).json({
        message: "No eligible users found",
        sentCount: 0,
      });
    }

    const recipientData = users.map((u) => ({
      campaignId,
      userId: u.userId,
    }));

    const logData = users.map((u) => ({
      campaignId,
      userId: u.userId,
      status: "SUCCESS" as const,
    }));

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
    });

    return res.json(campaigns);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch campaigns" });
  }
};

export const getCampaignRecipients = async (req:any, res: any) => {
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
    const { campaignName, notificationType, cityFilter } = req.body;

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
        ...(notificationType && { notificationType }),
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

