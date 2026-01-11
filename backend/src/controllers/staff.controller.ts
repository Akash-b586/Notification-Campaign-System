import prisma from "../config/prisma";

export const getAllStaff = async (req: any, res: any) => {
  try {
    const staff = await prisma.systemUser.findMany({
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(staff);
  } catch (error: any) {
    console.error("Get staff error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch staff members" });
  }
};
