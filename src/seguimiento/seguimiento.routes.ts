import { Router } from "express";
import { sanitizeSeguimientoInput,add } from "./seguimiento.controller.js";

export const SeguimientoRouter=Router()

SeguimientoRouter.post('/',sanitizeSeguimientoInput,add)