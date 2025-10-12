import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "mysecret";

// 🟢 SIGNUP
router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existing = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userResult = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
            [username, email, hashedPassword]
        );

        const user = userResult.rows[0];

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: "1d" });

        res.status(201).json({
            message: "Signup successful",
            user,
            token,
        });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Signup failed" });
    }
});

// 🟢 LOGIN
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "User not found" });
        }

        const user = result.rows[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            user: { id: user.id, username: user.username, email: user.email },
            token,
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
