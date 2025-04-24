import { Router } from 'express';
import {
  getAll,
  getOne,
  add,
  update,
  sanitizeCharacterInput,
  remove,
  updatePassword
} from './persona.controller.js';

export const personaRouter = Router();
personaRouter.patch('/updatePassword', sanitizeCharacterInput,updatePassword);
personaRouter.get('/', getAll);
personaRouter.get('/:id', getOne);
personaRouter.post('/', sanitizeCharacterInput, add);
personaRouter.put('/:id', sanitizeCharacterInput, update);
personaRouter.patch('/:id', sanitizeCharacterInput, update);
personaRouter.delete('/:id', remove);
