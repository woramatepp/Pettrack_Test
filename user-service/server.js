import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/user.js";
import path from "path";
import { fileURLToPath } from "url";
import petRoutes from "../pet-service/routes/pets.js";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Routes
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/pets", petRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../pet-service/uploads")));

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
