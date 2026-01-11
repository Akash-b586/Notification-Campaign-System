import { Request, Response } from "express";
import prisma from "../config/prisma";
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";

export const endUserSignup = async (req: any, res: any) => {
  try {
    const { name, email, password, phone, city } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        city,
        preference: { create: {} },
      },
    });

    res.status(201).json({ message: "Signup successful" });
  } catch (error) {}
};

export const systemUserSignup = async (req: any, res: any) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await prisma.systemUser.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await hashPassword(password);

    await prisma.systemUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    res.status(201).json({ message: "Signup successful" });
  } catch (error) {}
};

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    let user: any = await prisma.user.findUnique({ where: { email } });
    let userType: "END_USER" | "SYSTEM_USER" = "END_USER";

    if (!user) {
      user = await prisma.systemUser.findUnique({ where: { email } });
      userType = "SYSTEM_USER";
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const IsValidPassword = await comparePassword(password, user.password);
    if (!IsValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({
      userId: user.userId,
      userType,
      role: userType === "SYSTEM_USER" ? user.role : null,
    });

    res.cookie("jwt",token,{
        maxAge: 2*24*60*60*1000,
        httpOnly:true,
        sameSite:"lax",
        secure: process.env.NODE_ENV === "production"
    });

    return res.json({
      message: "Login successful",
      userId: user.userId,
      name: user.name,
      email: user.email,
      userType,
      role: userType === "SYSTEM_USER" ? user.role : null
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Login failed" });
  }
};

export const logout = (req: any, res: any) => {
  res.clearCookie("jwt");
  res.json({ message: "Logged out successfully" });
};
