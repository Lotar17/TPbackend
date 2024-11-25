import { Router } from 'express';
import {
  sanitizeLoginInput,
  loginUser,
  getRolByCookie,
} from './login.controller.js';

export const loginRouter = Router();
loginRouter.post('/', sanitizeLoginInput, loginUser);
loginRouter.get('/checkPermissions', getRolByCookie);
