import { Direccion } from './direccion.entity.js';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';

const em = orm.em;

function sanitizeDireccionInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
      
      calle: req.body.calle,
      numero:req.body.numero,
      localidad:req.body.localidad
      
      
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
          const direccion= em.create(Direccion, req.body.sanitizedInput);
          await em.flush();
          return res
            .status(201)
            .json({ message: 'Direccion created succesfully', data: direccion });
        } catch (error: any) {
          return res.status(500).json({ message: 'Failed to add new Direccion' });
        }
      }
    
      export {sanitizeDireccionInput,add}