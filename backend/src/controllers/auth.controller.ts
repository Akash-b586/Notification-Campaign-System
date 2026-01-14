import prisma from "../config/prisma";
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";

export const signup = async (req: any, res: any) => {
  try {
    const { name, email, password, phone, city, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
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
    });

    const token = signToken({
      userId: user.userId,
      role: user.role,
    });

    res.cookie("jwt", token, {
      maxAge: 2 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ 
      message: "Signup successful",
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Signup failed" });
  }
};

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "User account is inactive" });
    }

    const IsValidPassword = await comparePassword(password, user.password);
    if (!IsValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({
      userId: user.userId,
      role: user.role,
    });

    res.cookie("jwt", token, {
      maxAge: 2 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.json({
      message: "Login successful",
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
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