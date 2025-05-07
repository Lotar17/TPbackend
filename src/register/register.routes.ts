import { Router } from 'express';
import { sanitizeRegisterInput, registerUser } from './register.controller.js';

export const registerRouter = Router();
registerRouter.post('/', sanitizeRegisterInput, registerUser);