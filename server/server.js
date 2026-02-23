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
app.use(helmet());

// Logging (only in development)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// CORS Configuration
const allowedOrigins = [
  "https://inspectiq-u718.vercel.app",
  "http://localhost:8080",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

// Body Parser
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

/* =========================
   📁 Static Files
========================= */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

    // Optional: Safe index migration
    try {
      const LPT = require("./models/ndt/LiquidPenetrantInspection");
      const collection = LPT.collection;
      const indexes = await collection.indexes();

      const oldIndex = indexes.find(
        (idx) => idx.key && idx.key.report_no === 1 && !idx.sparse
      );

      if (oldIndex) {
        await collection.dropIndex(oldIndex.name);
        await collection.createIndex(
          { report_no: 1 },
          { unique: true, sparse: true }
        );
        console.log("[MIGRATION] report_no index updated to sparse");
      }
    } catch (migErr) {
      console.warn(
        "[MIGRATION] report_no index migration skipped:",
        migErr.message
      );
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });