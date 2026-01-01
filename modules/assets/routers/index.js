import express from 'express';
import * as controller from '../controller.js';

const router = express.Router();

router.get('/script.js', controller.getJs);
router.get('/style.css', controller.getCss);

// Aliases for drop-in replacement
router.get('/appy-tier3.js', controller.getJs);
router.get('/appy-tier3.css', controller.getCss);

export default router;
