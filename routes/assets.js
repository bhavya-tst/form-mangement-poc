
import express from 'express';
import assetsRoutes from '../modules/assets/routers/index.js';

const router = express.Router();

// Public routes - no authentication required for serving assets
router.use('/', assetsRoutes);

export default router;
