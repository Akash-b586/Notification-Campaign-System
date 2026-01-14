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
        isActive: true,
      },
    });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const getPreferences = async (req: any, res: any) => {
  const userId = req.user?.userId;

  const preferences = await prisma.preference.findUnique({
    where: { userId }
  });

  if (!preferences) {
    return res.status(404).json({ message: "Preferences not found" });
  }

  res.json(preferences);
};

export const updatePreferences = async (req: any, res: any) => {
  const userId = req.user?.userId;
  const { offers, orderUpdates, newsletter } = req.body;

  await prisma.preference.update({
    where: { userId },
    data: {
      ...(offers !== undefined && { offers }),
      ...(orderUpdates !== undefined && { orderUpdates }),
      ...(newsletter !== undefined && { newsletter })
    }
  });

  res.json({ message: "Preferences updated successfully" });
};

export const getAllUsersWithPreferences = async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        preference: true,
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

export const updateUserPreference = async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const { offers, orderUpdates, newsletter } = req.body;

    const updated = await prisma.preference.update({
      where: { userId },
      data: {
        ...(offers !== undefined && { offers }),
        ...(orderUpdates !== undefined && { orderUpdates }),
        ...(newsletter !== undefined && { newsletter }),
      },
    });

    res.json({ message: "Preference updated successfully", preference: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update preference" });
  }
};
