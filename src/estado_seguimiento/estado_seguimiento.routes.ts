import { Router } from "express";
import { add,sanitizeEstadoSeguimientoInput } from "./estado_seguimiento.controller.js";

export const EstadoSeguimientoRouter=Router()

EstadoSeguimientoRouter.post('/',sanitizeEstadoSeguimientoInput,add)