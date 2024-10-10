import { Router } from 'express';
import {
  getAll,
  getOne,
  add,
  update,
  sanitizeCharacterInput,
  remove,
} from './formaDePago.controller.js';

export const formaDePagoRouter = Router();

formaDePagoRouter.get('/', getAll);
formaDePagoRouter.get('/:id', getOne);
formaDePagoRouter.post('/', sanitizeCharacterInput, add);
formaDePagoRouter.put('/:id', sanitizeCharacterInput, update);
formaDePagoRouter.patch('/:id', sanitizeCharacterInput, update);
formaDePagoRouter.delete('/:id', remove);
