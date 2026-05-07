import { Router } from 'express';

import { getHome, getStats, getStatus } from '../controllers/systemController.js';

const router = Router();

router.get('/status', getStatus);
router.get('/stats', getStats);
router.get('/', getHome);

export default router;
