import { Request, Response } from "express";
import prisma from "../config/prisma";

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
