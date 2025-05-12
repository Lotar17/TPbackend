import { Router } from 'express';
import {
  sanitizeCompraInput,
  updateStock,
  getOne,
  add,
  remove,
  getComprasByPersona,
  update,
  getVentasByUser,
  getAll,
} from './compra.controler.js';

export const CompraRouter = Router();

CompraRouter.get('/', getAll);
CompraRouter.get('/:id', getOne);
CompraRouter.post('/', sanitizeCompraInput, add);
CompraRouter.delete('/:id', remove);
CompraRouter.put('/:id', sanitizeCompraInput, update);
CompraRouter.get('/persona/:personaId', getComprasByPersona);
CompraRouter.put('/stock/:id', sanitizeCompraInput, updateStock);
CompraRouter.get('/ventas/:id', getVentasByUser);
