import { NextFunction } from "express";

type Role = "ADMIN" | "CREATOR" | "VIEWER" | "CUSTOMER";

export const authorize = (...allowedRoles: Role[]) => {
  return (req: any, res: any, next: NextFunction) => {
    // Must have a user role
    if (!req.user?.role) {
      return res.status(403).json({ message: "Forbidden - No role found" });
    }
    
    // If no specific roles are required (viewer-only routes), allow all authenticated users
    if (allowedRoles.length === 0) {
      return next();
    }
  
    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Insufficient permissions" });
    }

    next();
  };
};
