import { Router } from 'express';
import { finishPayment, startPayment, webhookPayment } from '../controllers/payment.controller';

const router = Router();

// TODO validate data received - we can use 'joi' library

router.post('/start', startPayment);
router.post('/finish', finishPayment);
router.get('/webhook', webhookPayment)

export default router;