import { Router } from 'express';
import { setupBankAccount, getBalance, processTransaction, getAccountByNumber } from '../controllers/bank.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protected routes
router.post('/setup', authenticateToken, setupBankAccount);
router.get('/balance', authenticateToken, getBalance);
router.get('/account/:account_number', getAccountByNumber);

// Bank simulation (public for testing)
router.post('/transaction', processTransaction);

export default router;
