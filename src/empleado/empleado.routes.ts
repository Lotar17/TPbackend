import { Router } from 'express';
import {
  getAll,
  getOne,
  add,
  update,
  sanitizeCharacterInput,
  remove,
} from './empleado.controller.js';

export const EmpleadoRouter = Router();

EmpleadoRouter.get('/', getAll);
EmpleadoRouter.get('/:id', getOne);
EmpleadoRouter.post('/', sanitizeCharacterInput, add);
EmpleadoRouter.put('/:id', update);
EmpleadoRouter.delete('/:id', remove);
