import { Router } from 'express';
import {
  sanitizeLoginInput,
  loginUser,
  getRolByCookie,
  getUserInformation,
} from './login.controller.js';

export const loginRouter = Router();
loginRouter.post('/', sanitizeLoginInput, loginUser);
loginRouter.get('/checkPermissions', getRolByCookie);
loginRouter.get('/getUserInformation', getUserInformation);