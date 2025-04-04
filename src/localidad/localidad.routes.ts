import { Router } from "express";
import { sanitizeLocalidadInput,add } from "./localidad.controller.js";

export const LocalidadRouter=Router()

LocalidadRouter.post('/',sanitizeLocalidadInput,add)