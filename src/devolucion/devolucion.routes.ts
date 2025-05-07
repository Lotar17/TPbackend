import { Router } from "express";
import { CreateDevolutionRequest
  ,sanitizeDevolucionInput
  ,makeDecission
  ,getRequestbyVendedor,
  getRequestbyComprador,
   update,
  validoCantidad,
validoPendientes,
validaActualizacion} from "./devolucion.controller.js";

  export const DevolucionRouter= Router();

  
  DevolucionRouter.post('/', sanitizeDevolucionInput,CreateDevolutionRequest );
  DevolucionRouter.post('/pendiente/', sanitizeDevolucionInput,validoPendientes );
  DevolucionRouter.put('/:id',sanitizeDevolucionInput,makeDecission)
  DevolucionRouter.get('/:idVendedor',sanitizeDevolucionInput,getRequestbyVendedor)
  DevolucionRouter.get('/comprador/:idComprador',sanitizeDevolucionInput,getRequestbyComprador)
  DevolucionRouter.patch('/:id',sanitizeDevolucionInput,update)
  DevolucionRouter.post('/valido/', sanitizeDevolucionInput,validoCantidad );
  DevolucionRouter.get('/validaActualizacion/:idSolicitud',validaActualizacion)
