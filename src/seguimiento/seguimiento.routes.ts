import { Router } from "express";
import { sanitizeSeguimientoInput,add,getSeguimientosbyClient} from "./seguimiento.controller.js";

export const SeguimientoRouter=Router()

SeguimientoRouter.post('/',sanitizeSeguimientoInput,add)
SeguimientoRouter.get('/cliente/:idCliente',getSeguimientosbyClient)