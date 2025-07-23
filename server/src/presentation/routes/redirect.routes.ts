import { Router } from 'express';
import { UrlController } from '../controllers/UrlController';

const router = Router();
const urlController = new UrlController();

// GET /:shortUrl
router.get('/:shortCode', urlController.redirectToOriginalUrl);

export default router;