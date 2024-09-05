import { Router } from 'express';
import {
  sanitizeCompraInput,
  getAll,
  getOne,
  add,
  update,
  remove,
} from './compra.controler.js';

export const CompraRouter = Router();

CompraRouter.get('/', getAll);
CompraRouter.get('/:id', getOne);
CompraRouter.post('/', sanitizeCompraInput, add);
CompraRouter.put('/:id', sanitizeCompraInput, update);
CompraRouter.patch('/:id', sanitizeCompraInput, update);
CompraRouter.delete('/:id', remove);