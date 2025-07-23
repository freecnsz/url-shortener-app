import { Router } from 'express';
import { UrlController } from '../controllers/UrlController';

const router = Router();
const urlController = new UrlController();

// POST /api/urls/shorten
router.post('/shorten', urlController.createShortUrl);

export default router;