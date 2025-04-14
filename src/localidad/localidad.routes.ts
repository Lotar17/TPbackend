import { Router } from "express";
import { sanitizeLocalidadInput,add,getAll} from "./localidad.controller.js";

export const LocalidadRouter=Router()

LocalidadRouter.post('/',sanitizeLocalidadInput,add)
LocalidadRouter.get('/',getAll)