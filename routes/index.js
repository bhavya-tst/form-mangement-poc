
import express from 'express';
import formsRoutes from './forms.js';
import websitesRoutes from './websites.js';
import systemRoutes from './system.js';
import authRoutes from './auth.js';

const router = express.Router();

router.get('/health', (req, res) => {
    res.status(200).send('OK');
});

router.use('/auth', authRoutes); // Public
router.use('/forms', formsRoutes); // Protected (middleware inside)
router.use('/websites', websitesRoutes); // Protected (middleware inside)
router.use('/system', systemRoutes); // Protected (middleware inside)

export default router;
