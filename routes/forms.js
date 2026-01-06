
import express from "express";
import * as FormsController from "../modules/forms/controller.js";
import adminAuth from "../middlewares/adminAuth.js";

const router = express.Router();

router.use(adminAuth);

router.get("/", FormsController.getForms);
router.post("/", FormsController.createForm);
router.delete("/:id", FormsController.deleteForm);

export default router;
