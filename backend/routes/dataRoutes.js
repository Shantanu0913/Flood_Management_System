import express from 'express';
import { getIncidents, getSOSLogs, getResources, getStats } from '../controllers/dataController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/incidents', protect, getIncidents);
router.get('/sos-logs', protect, getSOSLogs);
router.get('/resources', protect, getResources);
router.get('/stats', protect, getStats);

export default router;
