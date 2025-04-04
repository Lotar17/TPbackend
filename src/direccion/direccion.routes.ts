import { Router } from "express";
import { sanitizeDireccionInput,add } from "./direccion.controller.js";

export const DireccionRouter=Router()

DireccionRouter.post('/',sanitizeDireccionInput,add)