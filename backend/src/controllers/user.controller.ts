import { Request, Response } from "express";
import prisma from "../config/prisma";
import { hashPassword } from "../utils/hash";

export const getAllUsers = async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
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
      orderBy: { name: 'asc' },
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getUser = async (req: any, res: any) => {
  try {
    const { userId } = req.params;

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
        preferences: true,
        orders: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

export const createUser = async (req: any, res: any) => {
  try {
    const { name, email, password, phone, city, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        city,
        role: role || "CUSTOMER",
        isActive: true,
      },
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

    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create user" });
  }
};

export const updateUser = async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, city, isActive, role } = req.body;

    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(city !== undefined && { city }),
        ...(isActive !== undefined && { isActive }),
        ...(role && { role }),
      },
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

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user" });
  }
};

export const deleteUser = async (req: any, res: any) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.delete({
      where: { userId },
    });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
