import { Router } from 'express';
import { getAll, getOne, add } from './persona.controller.js';

export const personaRouter = Router();

personaRouter.get('/', getAll);
personaRouter.get('/:id', getOne);
personaRouter.post('/', add);
