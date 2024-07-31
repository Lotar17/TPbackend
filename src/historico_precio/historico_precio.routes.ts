import { Router } from 'express';
import {
  sanitizePrecioInput,
  getAll,
  getOne,
  add,
  update,
  remove,
} from './historico_precio.controller.js';

export const HistoricoPrecioRouter = Router();

HistoricoPrecioRouter.get('/', getAll);
HistoricoPrecioRouter.get('/:id', getOne);
HistoricoPrecioRouter.post('/', sanitizePrecioInput, add);
HistoricoPrecioRouter.put('/:id', sanitizePrecioInput, update);
HistoricoPrecioRouter.patch('/:id', sanitizePrecioInput, update);
HistoricoPrecioRouter.delete('/:id', remove);
