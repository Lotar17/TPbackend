import { Router } from 'express';
import {
  sanitizePrecioInput,
  create,
  getAll,
  getOne,
  add,
  update,
  remove,
  getPreciosHistoricos
} from './historico_precio.controller.js';


export const HistoricoPrecioRouter = Router();
HistoricoPrecioRouter.post('/create',sanitizePrecioInput,create)
HistoricoPrecioRouter.get('/', getAll);
HistoricoPrecioRouter.get('/:id', getOne);
HistoricoPrecioRouter.post('/', sanitizePrecioInput, add);
HistoricoPrecioRouter.put('/:id', sanitizePrecioInput, update);
HistoricoPrecioRouter.patch('/:id', sanitizePrecioInput, update);
HistoricoPrecioRouter.delete('/:id', remove);
HistoricoPrecioRouter.get('/producto/:productoId', getPreciosHistoricos);
