import { Router } from 'express';
import {
  sanitizeProductoInput,
  getAll,
  getOne,
  add,
  update,
  remove,
  getProductsByUser,
  actualizarStock,
  getAllAdmin,
} from './producto.controler.js';

import { upload } from '../middleware/upload.js';

export const ProductoRouter = Router();

ProductoRouter.get('/:id', getOne);
ProductoRouter.post('/', upload.single('imagen'), sanitizeProductoInput, add);
ProductoRouter.put('/:id', sanitizeProductoInput, update);
ProductoRouter.patch('/:id', sanitizeProductoInput, update);
ProductoRouter.delete('/:id', remove);
ProductoRouter.put('/stock', sanitizeProductoInput, actualizarStock);
ProductoRouter.get('/persona/:idPersona', getProductsByUser);
ProductoRouter.get('/todos/:idPersona', getAll);
ProductoRouter.get('/', getAllAdmin); // Este getAll SOLO lo usa el admin
