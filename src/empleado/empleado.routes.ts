import { Router } from 'express';
import {
  getAll,
  getOne,
  add,
  update,
  sanitizeCharacterInput,
  remove,
  getempleadoByEmail
} from './empleado.controller.js';

export const EmpleadoRouter = Router();

EmpleadoRouter.get('/', getAll);
EmpleadoRouter.get('/:id', getOne);
EmpleadoRouter.post('/', sanitizeCharacterInput, add);
EmpleadoRouter.put('/:id', sanitizeCharacterInput, update);
EmpleadoRouter.delete('/:id', remove);
EmpleadoRouter.get('/employ/:email',getempleadoByEmail)
