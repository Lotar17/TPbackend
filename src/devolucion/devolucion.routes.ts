import { Router } from "express";
import { CreateDevolutionRequest,sanitizeDevolucionInput,makeDecission} from "./devolucion.controller.js";

  export const DevolucionRouter= Router();

  
  DevolucionRouter.post('/', sanitizeDevolucionInput,CreateDevolutionRequest );
  DevolucionRouter.put('/:id',sanitizeDevolucionInput,makeDecission)