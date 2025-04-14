import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import routes from "./routes/index";
import errorMiddleware from "./middlewares/error.middleware";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" , credentials: true}));
app.use(morgan("dev"));
app.use(helmet() as express.RequestHandler); // Security headers
app.use(express.json()); // Body parsing middleware
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", routes);

// Global error handling middleware
app.use(errorMiddleware);

export default app;
