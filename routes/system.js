
import express from "express";
import adminAuth from "../middlewares/adminAuth.js";
import CacheManager from "../utils/cacheManager.js";

const router = express.Router();

router.use(adminAuth);

router.post("/rebuild-cache", async (req, res) => {
    try {
        await CacheManager.rebuild();
        res.status(200).json({ status: 200, message: "Cache rebuild triggered successfully" });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
});

export default router;
