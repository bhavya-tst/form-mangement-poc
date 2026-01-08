
import express from "express";
import * as WebsitesController from "../modules/websites/controller.js";
import adminAuth from "../middlewares/adminAuth.js";
import { joiValidator } from "../middlewares/joiValidator.js";
import { migrateWebsitesSchema } from "../modules/websites/validation.js";

const router = express.Router();

router.use(adminAuth);

router.get("/", WebsitesController.getWebsites);
router.post("/", WebsitesController.createWebsite);
router.patch("/:id", WebsitesController.updateWebsite);
router.delete("/:id", WebsitesController.deleteWebsite);

// Bulk & Migration
router.post("/bulk-create", WebsitesController.bulkCreateWebsites);
router.post("/migrate", joiValidator(migrateWebsitesSchema), WebsitesController.migrateWebsites);

export default router;

