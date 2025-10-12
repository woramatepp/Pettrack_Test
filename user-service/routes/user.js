import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();

const uploadDir = "./uploads/profile_pics";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, `profile-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });

// --- GET /profile ---
router.get("/", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            `SELECT id, username AS name, email, age, phone, description, profile_picture
            FROM users WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ error: "User not found" });

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// --- PUT /profile ---
router.put("/", authenticateToken, upload.single("profile_picture"), async (req, res) => {
    const userId = req.user.id;
    const { username, email, age, phone, description } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (username !== undefined) { fields.push(`username=$${idx++}`); values.push(username); }
    if (email !== undefined) { fields.push(`email=$${idx++}`); values.push(email); }
    if (age !== undefined) { fields.push(`age=$${idx++}`); values.push(age); }
    if (phone !== undefined) { fields.push(`phone=$${idx++}`); values.push(phone); }
    if (description !== undefined) { fields.push(`description=$${idx++}`); values.push(description); }
    if (req.file) { fields.push(`profile_picture=$${idx++}`); values.push(req.file.filename); }

    values.push(userId);
    const query = `UPDATE users SET ${fields.join(", ")} WHERE id=$${idx} RETURNING *`;

    try {
        const result = await pool.query(query, values);
        res.json({ message: "Profile updated successfully", user: result.rows[0] });
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ error: "Failed to update profile" });
    }
});


export default router;
