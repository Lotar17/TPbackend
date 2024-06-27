import { Router } from 'express';
import {
  getAll,
  getOne,
  add,
  update,
  sanitizeCharacterInput,
  remove,
} from './categoria.controller.js';

export const categoriaRouter = Router();

categoriaRouter.get('/', getAll);
categoriaRouter.get('/:id', getOne);
categoriaRouter.post('/', sanitizeCharacterInput, add);
categoriaRouter.put('/:id', update);
categoriaRouter.delete('/:id', remove);
