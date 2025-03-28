import { Router } from "express";
import { CreateDevolutionRequest,sanitizeDevolucionInput,makeDecission,getRequestbyVendedor,getRequestbyComprador} from "./devolucion.controller.js";

  export const DevolucionRouter= Router();

  
  DevolucionRouter.post('/', sanitizeDevolucionInput,CreateDevolutionRequest );
  DevolucionRouter.put('/:id',sanitizeDevolucionInput,makeDecission)
  DevolucionRouter.get('/:idVendedor',sanitizeDevolucionInput,getRequestbyVendedor)
  DevolucionRouter.get('/comprador/:idComprador',sanitizeDevolucionInput,getRequestbyComprador)