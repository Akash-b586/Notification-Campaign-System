import prisma from "../config/prisma";
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";

// Password regex: At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const PHONE_REGEX = /^(\+91[-\s]?)?[0-9]{10}$/;

const validatePassword = (password: string): boolean => {
  return PASSWORD_REGEX.test(password);
};

const validatePhone = (phone: string): boolean => {
  return PHONE_REGEX.test(phone);
};

export const signup = async (req: any, res: any) => {
  try {
    const { name, email, password, phone, city, role } = req.body;

    if (!email || !password || !name || !phone || !city) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Validate password format
    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)" 
      });
    }

     // Validate phone format
    if (!validatePhone(phone)) {
      return res.status(400).json({ 
        message: "Phone number must be a valid 10-digit number (can include +91 prefix)" 
      });
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

    // Validate password format
    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)" 
      });
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


// const fn =async ()=>{
//   const hashedPassword = await hashPassword("Admin@1234");

//     await prisma.user.create({
//       data: {
//         name : "admin",
//         email:"admin@gmail.com",
//         password: hashedPassword,
//         phone: "9876543210",
//         city:"Delhi",
//         role:"ADMIN",
//         isActive: true,
//       },
//     });

//     console.log("USer created")
// };

// fn()