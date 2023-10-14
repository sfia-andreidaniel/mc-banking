import { Router } from 'express';
import {currentUser, signIn, signUp} from "../controller/authenticationController";
import {authenticateToken} from "../middleware/auth";

const router = Router();

router.get('/current-user', authenticateToken, currentUser);
router.post('/sign-in', signIn);
router.post('/sign-up', signUp)

export default router;