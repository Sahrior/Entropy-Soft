import { Router } from 'express';
import { submitApplication } from '../controllers/careerController.js';
import { careersLimiter } from '../middleware/rateLimiters.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();
// Rate limit first so abusive clients are stopped before any upload is written to disk.
router.post('/apply', careersLimiter, upload.single('cv'), submitApplication);
export default router;
