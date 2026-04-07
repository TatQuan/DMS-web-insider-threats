require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const rateLimit = require("express-rate-limit");
const configViewEngine = require("./config/viewEngine.js");

// Route imports
const authRoute = require("./routes/authRoutes.js");
const dashboardRoute = require("./routes/dashboardRoutes.js");
const documentRoute = require("./routes/documentRoutes.js");
const userRoute = require("./routes/userRoutes.js");
const auditRoute = require("./routes/auditRouters.js");

const globalErrorHandler = require("./middleware/errorHandler.js");
const corsConfig = require("./config/corsConfig.js");

const app = express();
const port = process.env.PORT || 8888; // hard code port

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 try per IP
  message: "Too many login attempts, please try again 15 minutes later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cookieParser()); // for read cookie

// config cors
app.use(corsConfig.cors(corsConfig.corsOptions));

// config req.body
app.use(express.json()); // for read and process data json
app.use(express.urlencoded({ extended: true })); // for read and get form data

// config template (view) engine
configViewEngine(app);

// --- Route Initialization ---
app.use("/auth", authRoute);
app.use("/dashboard", dashboardRoute);
app.use("/upload", documentRoute);
app.use("/users", userRoute);
app.use("/audit-log", auditRoute);

// Global Error Handler
app.use(globalErrorHandler);

// new rout dynamic
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
