import { Router } from 'express';
import {
  sanitizeCompraInput,

  getOne,
  add,
  remove,
  getComprasByPersona
} from './compra.controler.js';

export const CompraRouter = Router();


CompraRouter.get('/:id', getOne);
CompraRouter.post('/', sanitizeCompraInput, add);
CompraRouter.delete('/:id', remove);

CompraRouter.get('/persona/:personaId',getComprasByPersona)