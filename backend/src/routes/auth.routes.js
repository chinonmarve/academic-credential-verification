const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { requireAuth, JWT_SECRET } = require("../middleware/auth");
const auditService = require("../services/auditService");

const router = express.Router();

router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = db.findOne(
      "users",
      (u) => String(u.email || "").trim().toLowerCase() === normalizedEmail
    );

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = bcrypt.compareSync(String(password), user.passwordHash);

    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        name: user.name,
        institutionId: user.institutionId || null
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Audit logging must never prevent a successful login.
    try {
      auditService.log({
        event: "User Login",
        userLabel: user.name,
        result: "success"
      });
    } catch (auditError) {
      console.error("Login audit logging failed:", auditError);
    }

    const { passwordHash, ...safeUser } = user;

    return res.json({ token, user: safeUser });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "Login service error. Please try again."
    });
  }
});

router.get("/me", requireAuth, (req, res) => {
  try {
    const user = db.findOne("users", (u) => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { passwordHash, ...safeUser } = user;
    return res.json({ user: safeUser });
  } catch (error) {
    console.error("Session lookup error:", error);
    return res.status(500).json({ error: "Unable to load your session" });
  }
});

module.exports = router;
