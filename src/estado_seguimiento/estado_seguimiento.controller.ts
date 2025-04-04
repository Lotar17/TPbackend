import { EstadoSeguimiento } from "./estado_seguimiento.entity.js";
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';

const em = orm.em;

function sanitizeEstadoSeguimientoInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
      
      estado: req.body.estado,
      fecha:req.body.fecha,
      localidad: req.body.localidad,
      empleado: req.body.empleado,
      seguimiento:req.body.seguimiento
      
    };
  
    Object.keys(req.body.sanitizedInput).forEach((key) => {
      if (req.body.sanitizedInput[key] === undefined) {
        delete req.body.sanitizedInput[key];
      }
    });
  
    next();
  }
  
  async function add(req: Request, res: Response) {
    try {
      const estado = em.create(EstadoSeguimiento, req.body.sanitizedInput);
      await em.flush();
      return res
        .status(201)
        .json({ message: 'Estado seguimiento created succesfully', data: estado });
    } catch (error: any) {
      return res.status(500).json({ message: 'Failed to add new Estado seguimiento' });
    }
  }

  export {sanitizeEstadoSeguimientoInput,add}