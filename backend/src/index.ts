import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import preferenceRoutes from "./routes/preference.routes";
import campaignRoutes from "./routes/campaign.routes";
import userRoutes from "./routes/user.routes";
import logRoutes from "./routes/log.routes";
import statsRoutes from "./routes/stats.routes";
import staffRoutes from "./routes/staff.routes";
import orderRoutes from "./routes/order.routes";
import productRoutes from "./routes/product.routes";
import newsletterRoutes from "./routes/newsletter.routes";
import { authenticate } from "./middleware/auth.middleware";

dotenv.config();

const app = express();

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes (AUTH & PRODUCTS)
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes); // Products publicly viewable

// Protected routes
app.use(authenticate);

app.use("/api/me", preferenceRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/newsletters", newsletterRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/staff", staffRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
