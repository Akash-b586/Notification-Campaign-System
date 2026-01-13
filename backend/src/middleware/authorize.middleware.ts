import {NextFunction } from "express";

type Role = "ADMIN" | "CREATOR" | "VIEWER";

export const authorize = (...allowedRoles: Role[]) => {
  return (req: any, res: any, next: NextFunction) => {
    // Must be system user
    if (req.user?.userType !== "SYSTEM_USER") {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    // Viewer-only routes can pass empty roles
    if (allowedRoles.length === 0) {
      return next();
    }
  
    if (!allowedRoles.includes(req.user?.role!)) {
      return res
        .status(403)
        .json({ message: "Insufficient permissions" });
    }

    next();
  };
};
