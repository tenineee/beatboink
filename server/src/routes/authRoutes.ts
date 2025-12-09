import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validateRegister, validateLogin } from '../middleware/validation';
import { authorization } from '../middleware/authorization';
import { authLimiter } from '../middleware/rateLimiter';
import {verify} from "node:crypto";

const router = Router();

router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/register', authLimiter, validateRegister, authController.register);
router.get('/verify', authorization, authController.verify);
router.get('/profile', authorization, authController.getProfile);

export default router;