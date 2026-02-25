// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   🔐 Security Middlewares
========================= */

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Logging (only in development)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* =========================
   🌐 CORS Configuration
========================= */

// Allowed origins
const allowedOrigins = [
  "https://inspectiq-xiet.vercel.app",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Rejected origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
  })
);

// CORS is already handled by app.use() above, including preflights.

/* =========================
   📝 Body Parser
========================= */
app.use(express.json());

/* =========================
   📂 Routes Import
========================= */
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const profileRoutes = require("./routes/profile");
const inspectionRoutes = require("./routes/inspections");
const uploadRoutes = require("./routes/upload");
const registrationKeyRoutes = require("./routes/registrationKeys");
const serviceRoutes = require("./routes/services");
const clientRoutes = require("./routes/clients");
const userRoutes = require("./routes/users");

const ultrasonicRoutes = require("./routes/ndt/ultrasonic");
const magneticParticleRoutes = require("./routes/ndt/magneticParticle");
const liquidPenetrantRoutes = require("./routes/ndt/liquidPenetrant");
const ndtSummaryRoutes = require("./routes/ndt/ndtSummary");

const engineeringRoutes = require("./routes/tpi/engineering");
const weldingAuditRoutes = require("./routes/consultancy/weldingAssessmentAudit");
const companyProfileRoutes = require("./routes/companyProfile");

/* =========================
   🚀 Use Routes
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/registration-keys", registrationKeyRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/users", userRoutes);

app.use("/api/ndt/ultrasonic", ultrasonicRoutes);
app.use("/api/ndt/magnetic-particle", magneticParticleRoutes);
app.use("/api/ndt/liquid-penetrant", liquidPenetrantRoutes);
app.use("/api/ndt/summary", ndtSummaryRoutes);

app.use("/api/tpi/engineering", engineeringRoutes);
app.use("/api/consultancy/welding-audit", weldingAuditRoutes);
app.use("/api/company-profile", companyProfileRoutes);

/* =========================
   📁 Static Files
========================= */
app.use("/uploads", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(path.join(__dirname, "uploads")));

/* =========================
   ❤️ Health Check
========================= */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

/* =========================
   🏠 Root Route
========================= */
app.get("/", (req, res) => {
  res.send("QCWS Inspection API is running...");
});

/* =========================
   ❌ Global Error Handler
========================= */
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.message);
  console.error("STACK:", err.stack);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {}
  });
});

/* =========================
   🗄 Database Connection
========================= */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Optional: Migration for report_no index
    const migrateModel = async (modelPath, modelName) => {
      try {
        const Model = require(modelPath);
        const collection = Model.collection;
        const indexes = await collection.indexes();

        const uniqueIndex = indexes.find(
          (idx) => idx.key && idx.key.report_no === 1 && idx.unique
        );
        if (uniqueIndex) await collection.dropIndex(uniqueIndex.name);

        const sparseIndex = indexes.find(
          (idx) => idx.key && idx.key.report_no === 1 && idx.sparse && !idx.unique
        );
        if (!sparseIndex) await collection.createIndex({ report_no: 1 }, { sparse: true });
      } catch (migErr) {
        console.warn(`[MIGRATION] ${modelName} migration skipped:`, migErr.message);
      }
    };

    await migrateModel("./models/ndt/LiquidPenetrantInspection", "LiquidPenetrantInspection");
    await migrateModel("./models/ndt/MagneticParticleInspection", "MagneticParticleInspection");
    await migrateModel("./models/ndt/UltrasonicInspection", "UltrasonicInspection");
    await migrateModel("./models/ndt/NDTSummaryInspection", "NDTSummaryInspection");
    await migrateModel("./models/tpi/EngineeringInspection", "EngineeringInspection");
    await migrateModel("./models/consultancy/WeldingAssessmentAudit", "WeldingAssessmentAudit");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });