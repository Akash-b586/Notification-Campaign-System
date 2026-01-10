import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import preferenceRoutes from "./routes/preference.routes";
import campaignRoutes from "./routes/campaign.routes";
import { authenticate } from "./middleware/auth.middleware";

dotenv.config();

const app = express();

// Middleware
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes (AUTH)
app.use("/auth",authRoutes);

// Protected routes
app.use(authenticate);

app.use("/me",preferenceRoutes);
app.use("/campaigns", campaignRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

