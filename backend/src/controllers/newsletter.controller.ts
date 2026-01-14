import prisma from "../config/prisma";

export const createNewsletter = async (req: any, res: any) => {
  try {
    const { slug, title, description, isActive } = req.body;

    if (!slug || !title) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if slug already exists
    const existingNewsletter = await prisma.newsletter.findUnique({
      where: { slug },
    });

    if (existingNewsletter) {
      return res.status(400).json({ message: "Newsletter with this slug already exists" });
    }

    const newsletter = await prisma.newsletter.create({
      data: {
        slug,
        title,
        description,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json({
      message: "Newsletter created successfully",
      newsletter,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create newsletter" });
  }
};

export const getNewsletter = async (req: any, res: any) => {
  try {
    const { newsletterId } = req.params;

    const newsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId },
      include: {
        subscriptions: {
          select: {
            id: true,
            userId: true,
            email: true,
            sms: true,
            push: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter not found" });
    }

    res.json(newsletter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch newsletter" });
  }
};

export const getAllNewsletters = async (req: any, res: any) => {
  try {
    const newsletters = await prisma.newsletter.findMany({
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(newsletters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch newsletters" });
  }
};

export const updateNewsletter = async (req: any, res: any) => {
  try {
    const { newsletterId } = req.params;
    const { title, description, isActive } = req.body;

    const newsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId },
    });

    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter not found" });
    }

    const updatedNewsletter = await prisma.newsletter.update({
      where: { id: newsletterId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({
      message: "Newsletter updated successfully",
      newsletter: updatedNewsletter,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update newsletter" });
  }
};

export const deleteNewsletter = async (req: any, res: any) => {
  try {
    const { newsletterId } = req.params;

    const newsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId },
    });

    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter not found" });
    }

    await prisma.newsletter.delete({
      where: { id: newsletterId },
    });

    res.json({ message: "Newsletter deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete newsletter" });
  }
};

// Publish newsletter to all subscribers
export const publishNewsletter = async (req: any, res: any) => {
  try {
    const { newsletterId } = req.params;

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

    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter not found" });
    }

    if (!newsletter.isActive) {
      return res.status(400).json({ message: "Newsletter is not active" });
    }

    if (newsletter.subscriptions.length === 0) {
      return res.status(200).json({
        message: "Newsletter has no subscribers",
        publishCount: 0,
      });
    }

    // Create notification logs for each subscriber and enabled channel
    const logData: any[] = [];

    for (const subscription of newsletter.subscriptions) {
      const channels = ['EMAIL', 'SMS', 'PUSH'] as const;

      for (const channel of channels) {
        const isChannelEnabled = subscription[channel.toLowerCase() as keyof typeof subscription];
        if (isChannelEnabled) {
          logData.push({
            userId: subscription.userId,
            notificationType: 'NEWSLETTER',
            channel,
            status: 'SUCCESS',
            newsletterId,
          });
        }
      }
    }

    if (logData.length > 0) {
      await prisma.notificationLog.createMany({
        data: logData,
      });
    }

    res.json({
      message: "Newsletter published successfully",
      publishCount: newsletter.subscriptions.length,
      totalNotifications: logData.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to publish newsletter" });
  }
};

// Get newsletter subscribers
export const getNewsletterSubscribers = async (req: any, res: any) => {
  try {
    const { newsletterId } = req.params;

    const subscribers = await prisma.newsletterSubscription.findMany({
      where: { newsletterId },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(subscribers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch subscribers" });
  }
};

// Get newsletter publish logs
export const getNewsletterLogs = async (req: any, res: any) => {
  try {
    const { newsletterId } = req.params;

    const logs = await prisma.notificationLog.findMany({
      where: {
        newsletterId,
        notificationType: 'NEWSLETTER',
      },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        sentAt: "desc",
      },
    });

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch newsletter logs" });
  }
};
