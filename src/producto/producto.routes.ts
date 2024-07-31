import { Router } from 'express';
import {
  sanitizeProductoInput,
  getAll,
  getOne,
  add,
  update,
  remove,
} from './producto.controler.js';

export const ProductoRouter = Router();

ProductoRouter.get('/', getAll);
ProductoRouter.get('/:id', getOne);
ProductoRouter.post('/', sanitizeProductoInput, add);
ProductoRouter.put('/:id', sanitizeProductoInput, update);
ProductoRouter.patch('/:id', sanitizeProductoInput, update);
ProductoRouter.delete('/:id', remove);
