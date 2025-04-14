import { Router } from "express";

import { sanitizeCorreoInput, enviarCorreo } from './correo.controller.js';

export const CorreoRouter = Router();

CorreoRouter.post('/', sanitizeCorreoInput, enviarCorreo);