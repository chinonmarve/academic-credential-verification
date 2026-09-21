const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { requireAuth, JWT_SECRET } = require("../middleware/auth");
const auditService = require("../services/auditService");

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = db.findOne("users", (u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const match = bcrypt.compareSync(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name, institutionId: user.institutionId || null },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  auditService.log({ event: "User Login", userLabel: user.name, result: "success" });

  const { passwordHash, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

router.get("/me", requireAuth, (req, res) => {
  const user = db.findOne("users", (u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser });
});

module.exports = router;
