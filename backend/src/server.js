require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const { getPublicBaseUrl } = require("./services/qrService");

const authRoutes = require("./routes/auth.routes");
const universityRoutes = require("./routes/university.routes");
const studentRoutes = require("./routes/student.routes");
const verificationRoutes = require("./routes/verification.routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "ACV Backend Prototype" });
});

app.use("/api/auth", authRoutes);
app.use("/api/university", universityRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/verify", verificationRoutes);

// Serve the built frontend when running the full application locally
// from the backend process. Vercel uses the dedicated frontend service.
const FRONTEND_DIST = path.join(__dirname, "..", "..", "frontend", "dist");
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, "index.html"));
  });
}

// Central error handler - never leak stack traces to the client
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// Vercel uses the exported Express application.
// Local development still starts the HTTP server normally.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`ACV backend running on http://localhost:${PORT}`);
    if (!process.env.PUBLIC_BASE_URL) {
      console.log(
        "Note: PUBLIC_BASE_URL is not set, so generated QR codes point at " +
          "http://localhost:" + PORT + ". Set PUBLIC_BASE_URL in backend/.env " +
          "to your deployed domain before demoing the QR workflow from a phone."
      );
    } else {
      console.log(`QR codes will point to: ${getPublicBaseUrl()}/verify?id=...`);
    }
    if (!fs.existsSync(FRONTEND_DIST)) {
      console.log("Note: frontend/dist not found yet. Run `npm run build` inside /frontend first.");
    }
  });
}

module.exports = app;
