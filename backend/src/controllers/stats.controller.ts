import prisma from "../config/prisma";

export const getSummaryStats = async (req: any, res: any) => {
  try {
    // Count active users
    const activeUsers = await prisma.user.count({
      where: { isActive: true },
    });

    // Count campaigns by status
    const [sentCampaigns, draftCampaigns] = await Promise.all([
      prisma.campaign.count({ where: { status: 'SENT' } }),
      prisma.campaign.count({ where: { status: 'DRAFT' } }),
    ]);

    // Count total notifications
    const totalNotifications = await prisma.notificationLog.count();

    res.json({
      activeUsers,
      campaignsSent: sentCampaigns,
      draftCampaigns,
      totalNotifications,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch summary stats' });
  }
};

export const getActivityStats = async (req: any, res: any) => {
  try {
    // Get notification activity for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const notifications = await prisma.notificationLog.findMany({
      where: {
        sentAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        sentAt: true,
      },
      orderBy: {
        sentAt: 'asc',
      },
    });

    // Group by date
    const activityMap = new Map<string, number>();
    
    // Initialize last 7 days with 0 counts
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      activityMap.set(dateStr, 0);
    }

    // Count notifications per day
    notifications.forEach((log: any) => {
      const dateStr = new Date(log.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (activityMap.has(dateStr)) {
        activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
      }
    });

    const activityData = Array.from(activityMap.entries()).map(([date, notifications]) => ({
      date,
      notifications,
    }));

    res.json(activityData);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch activity stats' });
  }
};

export const getCampaignDistribution = async (req: any, res: any) => {
  try {
    const campaigns = await prisma.campaign.groupBy({
      by: ['notificationType'],
      _count: {
        notificationType: true,
      },
    });

    const distribution = campaigns.map((item: any) => ({
      type: item.notificationType.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      count: item._count.notificationType,
    }));

    res.json(distribution);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch campaign distribution' });
  }
};

export const getRecentActivity = async (req: any, res: any) => {
  try {
    // Get recent notification logs with campaign, newsletter, order and user info
    const recentLogs = await prisma.notificationLog.findMany({
      take: 10,
      orderBy: {
        sentAt: 'desc',
      },
      include: {
        campaign: {
          select: {
            campaignName: true,
          },
        },
        newsletter: {
          select: {
            title: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const activities = recentLogs.map((log: any) => {
      const timeDiff = Date.now() - new Date(log.sentAt).getTime();
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      const timeStr = hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo} hours ago` : `${Math.floor(hoursAgo / 24)} days ago`;

      let sourceName = '';
      if (log.campaign) {
        sourceName = log.campaign.campaignName;
      } else if (log.newsletter) {
        sourceName = log.newsletter.title;
      } else if (log.order) {
        sourceName = log.order.orderNumber;
      }

      return {
        action: `Notification sent for "${sourceName}"`,
        user: log.user.name,
        time: timeStr,
        type: log.status === 'SUCCESS' ? 'success' : 'error',
      };
    });

    res.json(activities);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message || 'Failed to fetch recent activity' });
  }
};
