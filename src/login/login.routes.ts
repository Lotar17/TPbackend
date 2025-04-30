import { Router } from 'express';
import {
  sanitizeLoginInput,
  loginUser,
  getRolByCookie,
  getUserInformation,
  updatePassword,
  logout
} from './login.controller.js';

export const loginRouter = Router();
loginRouter.post('/', sanitizeLoginInput, loginUser);
loginRouter.get('/checkPermissions', getRolByCookie);
loginRouter.get('/getUserInformation', getUserInformation);
loginRouter.post('/logout',sanitizeLoginInput,logout)
loginRouter.patch('/updatePassword',sanitizeLoginInput,updatePassword)



