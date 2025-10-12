import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();

// สร้างโฟลเดอร์ถ้ายังไม่มี
const uploadDir = "uploads/pets";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ตั้งค่า multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + unique + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// ✅ GET /pets 
router.get("/", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM pet WHERE user_id = $1 ORDER BY created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching pets:", err);
        res.status(500).json({ message: "Error fetching pets" });
    }
});

// ✅ GET /pets/:id 
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT * FROM pet WHERE id = $1 AND user_id = $2`,
            [id, req.user.id]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ message: "Pet not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching pet:", err);
        res.status(500).json({ message: "Error fetching pet" });
    }
});


// ✅ POST /pets/petadd 
router.post("/petadd", authenticateToken, upload.single("image"), async (req, res) => {
    try {
        const { name, age, sex, weight, type, description } = req.body;
        const userId = req.user.id;

        if (!name || !age || !sex || !weight || !type || !description) {
            return res.status(400).json({ message: "All fields required" });
        }

        const imagePath = req.file ? `/uploads/pets/${req.file.filename}` : null;

        const result = await pool.query(
            `INSERT INTO pet (user_id, name, age, sex, weight, "type", description, image)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *`,
            [userId, name, age, sex, weight, type, description, imagePath]
        );

        res.status(201).json({ message: "Pet added successfully!", pet: result.rows[0] });
    } catch (err) {
        console.error("Error adding pet:", err);
        res.status(500).json({ message: "Error adding pet", error: err.message });
    }
});

// ✅ PUT /pets/:id 
router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, age, sex, weight, type, description } = req.body;
        const userId = req.user.id;

        // ตรวจสอบว่ามีข้อมูลครบ
        if (!name || !age || !sex || !weight || !type || !description) {
            return res.status(400).json({ message: "All fields required" });
        }

        // อัปเดตข้อมูลใน DB
        const result = await pool.query(
            `UPDATE pet SET name=$1, age=$2, sex=$3, weight=$4, "type"=$5, description=$6
       WHERE id=$7 AND user_id=$8 RETURNING *`,
            [name, age, sex, weight, type, description, id, userId]
        );

        res.json({ message: "Pet updated successfully!", pet: result.rows[0] });
    } catch (err) {
        console.error("Error updating pet:", err);
        res.status(500).json({ message: "Error updating pet", error: err.message });
    }
});

// ✅ DELETE /pets/:id
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const petResult = await pool.query(
            `SELECT image FROM pet WHERE id = $1 AND user_id = $2`,
            [id, req.user.id]
        );

        if (petResult.rows.length === 0) {
            return res.status(404).json({ message: "Pet not found" });
        }

        const imagePath = petResult.rows[0].image;
        if (imagePath) {
            const fullPath = path.join(process.cwd(), imagePath);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }

        await pool.query(`DELETE FROM pet WHERE id = $1 AND user_id = $2`, [id, req.user.id]);

        res.json({ message: "Pet deleted successfully!" });
    } catch (err) {
        console.error("Error deleting pet:", err);
        res.status(500).json({ message: "Error deleting pet", error: err.message });
    }
});

export default router;
