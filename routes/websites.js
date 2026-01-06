
import express from "express";
import * as WebsitesController from "../modules/websites/controller.js";
import adminAuth from "../middlewares/adminAuth.js";

const router = express.Router();

router.use(adminAuth);

router.get("/", WebsitesController.getWebsites);
router.post("/", WebsitesController.createWebsite);
router.patch("/:id", WebsitesController.updateWebsite);
router.delete("/:id", WebsitesController.deleteWebsite);

// Bulk & Migration
router.post("/bulk-create", WebsitesController.bulkCreateWebsites);
router.post("/migrate", WebsitesController.migrateWebsites);

export default router;
