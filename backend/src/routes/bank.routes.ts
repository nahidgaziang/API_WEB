import { Router } from 'express';
import { setupBankAccount, getBalance, processTransaction, getAccountByNumber } from '../controllers/bank.controller';
import { authenticateToken } from '../middleware/auth';
const router = Router();
router.post('/setup', authenticateToken, setupBankAccount);
router.get('/balance', authenticateToken, getBalance);
router.get('/account/:account_number', authenticateToken, getAccountByNumber);
router.post('/transaction', authenticateToken, processTransaction);
export default router;
