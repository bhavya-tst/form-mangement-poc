import express from 'express';
import assetsRouter from '../modules/assets/routers/index.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

router.use('/assets', assetsRouter);

export default router;
