import { Router } from "express";
import { add,sanitizeEstadoSeguimientoInput,searchEmployee,getStatebyEmployee,update} from "./estado_seguimiento.controller.js";

export const EstadoSeguimientoRouter=Router()

EstadoSeguimientoRouter.post('/',sanitizeEstadoSeguimientoInput,add)
EstadoSeguimientoRouter.get('/:idLocalidad',searchEmployee)
EstadoSeguimientoRouter.get('/empleado/:idEmpleado',getStatebyEmployee)
EstadoSeguimientoRouter.patch('/:id',sanitizeEstadoSeguimientoInput,update)