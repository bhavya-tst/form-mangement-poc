
import express from "express";
import * as FormsController from "../modules/forms/controller.js";
import adminAuth from "../middlewares/adminAuth.js";
import { joiValidator } from "../middlewares/joiValidator.js";
import { createFormSchema } from "../modules/forms/validation.js";

const router = express.Router();

router.use(adminAuth);

router.get("/", FormsController.getForms);
router.post("/", joiValidator(createFormSchema), FormsController.createForm);
router.patch("/:id/set-default", FormsController.setDefaultForm);
router.delete("/:id", FormsController.deleteForm);

export default router;
