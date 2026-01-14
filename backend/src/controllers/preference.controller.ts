import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getProfile = async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;
    const { name, email, phone, city } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(city !== undefined && { city }),
      },
      select: {
        userId: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        role: true,
        isActive: true,
      },
    });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// Get notification preferences for a specific notification type (OFFERS or ORDER_UPDATES)
export const getNotificationPreferences = async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;
    const { notificationType } = req.params;

    // Validate notification type
    const validTypes = ['OFFERS', 'ORDER_UPDATES'];
    if (!validTypes.includes(notificationType)) {
      return res.status(400).json({ message: "Invalid notification type" });
    }

    let preferences = await prisma.notificationPreference.findUnique({
      where: {
        userId_notificationType: {
          userId,
          notificationType: notificationType as any,
        },
      },
    });

    // If no preference exists, return default (all enabled)
    if (!preferences) {
      preferences = {
        id: '',
        userId,
        notificationType: notificationType as any,
        email: true,
        sms: true,
        push: true,
        updatedAt: new Date(),
      };
    }

    res.json(preferences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch preferences" });
  }
};

// Update notification preferences for a specific notification type
export const updateNotificationPreferences = async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;
    const { notificationType } = req.params;
    const { email, sms, push } = req.body;

    // Validate notification type
    const validTypes = ['OFFERS', 'ORDER_UPDATES'];
    if (!validTypes.includes(notificationType)) {
      return res.status(400).json({ message: "Invalid notification type" });
    }

    const preferences = await prisma.notificationPreference.upsert({
      where: {
        userId_notificationType: {
          userId,
          notificationType: notificationType as any,
        },
      },
      update: {
        ...(email !== undefined && { email }),
        ...(sms !== undefined && { sms }),
        ...(push !== undefined && { push }),
      },
      create: {
        userId,
        notificationType: notificationType as any,
        email: email !== undefined ? email : true,
        sms: sms !== undefined ? sms : true,
        push: push !== undefined ? push : true,
      },
    });

    res.json({ message: "Preferences updated successfully", preferences });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update preferences" });
  }
};

// Get all notification preferences for user
export const getAllNotificationPreferences = async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;

    const preferences = await prisma.notificationPreference.findMany({
      where: { userId },
    });

    res.json(preferences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch preferences" });
  }
};

// Get user's newsletter subscriptions
export const getNewsletterSubscriptions = async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;

    const subscriptions = await prisma.newsletterSubscription.findMany({
      where: { userId },
      include: {
        newsletter: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            isActive: true,
          },
        },
      },
    });

    res.json(subscriptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch newsletter subscriptions" });
  }
};

// Subscribe to a newsletter
export const subscribeToNewsletter = async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;
    const { newsletterId } = req.params;
    const { email, sms, push } = req.body;

    // Check if newsletter exists
    const newsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId },
    });

    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter not found" });
    }

    const subscription = await prisma.newsletterSubscription.upsert({
      where: {
        userId_newsletterId: {
          userId,
          newsletterId,
        },
      },
      update: {
        ...(email !== undefined && { email }),
        ...(sms !== undefined && { sms }),
        ...(push !== undefined && { push }),
      },
      create: {
        userId,
        newsletterId,
        email: email !== undefined ? email : true,
        sms: sms !== undefined ? sms : false,
        push: push !== undefined ? push : false,
      },
    });

    res.status(201).json({ 
      message: "Subscribed to newsletter successfully", 
      subscription 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to subscribe to newsletter" });
  }
};

// Unsubscribe from a newsletter
export const unsubscribeFromNewsletter = async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;
    const { newsletterId } = req.params;

    await prisma.newsletterSubscription.delete({
      where: {
        userId_newsletterId: {
          userId,
          newsletterId,
        },
      },
    });

    res.json({ message: "Unsubscribed from newsletter successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to unsubscribe from newsletter" });
  }
};

// Admin: Get all users with their preferences
export const getAllUsersWithPreferences = async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        preferences: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users with preferences" });
  }
};

// Admin: Update a user's notification preference
export const updateUserNotificationPreference = async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const { notificationType } = req.params;
    const { email, sms, push } = req.body;

    // Validate notification type
    const validTypes = ['OFFERS', 'ORDER_UPDATES'];
    if (!validTypes.includes(notificationType)) {
      return res.status(400).json({ message: "Invalid notification type" });
    }

    const updated = await prisma.notificationPreference.upsert({
      where: {
        userId_notificationType: {
          userId,
          notificationType: notificationType as any,
        },
      },
      update: {
        ...(email !== undefined && { email }),
        ...(sms !== undefined && { sms }),
        ...(push !== undefined && { push }),
      },
      create: {
        userId,
        notificationType: notificationType as any,
        email: email !== undefined ? email : true,
        sms: sms !== undefined ? sms : true,
        push: push !== undefined ? push : true,
      },
    });

    res.json({ message: "Preference updated successfully", preference: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update preference" });
  }
};
