import {Router} from "express";
import {
    createTransaction,
    deleteTransaction,
    getAllUserTransactions,
    getUserTransactionById,
    updateTransaction
} from "../controller/transactionsController";
import {authenticateToken} from "../middleware/auth";

const router = Router();

router.get('/', authenticateToken, getAllUserTransactions);
router.post('/', authenticateToken, createTransaction);
router.get('/:id', authenticateToken, getUserTransactionById);
router.put('/:id', authenticateToken, updateTransaction);
router.delete('/:id', authenticateToken, deleteTransaction);

export default router;