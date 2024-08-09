import { Router } from 'express';
import { sanitizeLoginInput, loginUser } from './login.controller.js';

export const loginRouter = Router();
loginRouter.post('/', sanitizeLoginInput, loginUser);
