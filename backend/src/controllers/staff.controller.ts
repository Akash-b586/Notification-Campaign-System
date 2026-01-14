import prisma from "../config/prisma";

// Get all staff members (ADMIN, CREATOR roles)
export const getAllStaff = async (req: any, res: any) => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'CREATOR'],
        },
      },
      select: {
        userId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
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
