import { Localidad } from './localidad.entity.js';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';

const em = orm.em;

function sanitizeLocalidadInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
      
      nombre: req.body.nombre,
      codigoPostal:req.body.codigoPostal,
      provincia:req.body.provincia
      
      
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
        const localidad = em.create(Localidad, req.body.sanitizedInput);
        await em.flush();
        return res
          .status(201)
          .json({ message: 'Localidad created succesfully', data: localidad });
      } catch (error: any) {
        return res.status(500).json({ message: 'Failed to add new Localidad' });
      }
    }
    async function getAll(req:Request,res:Response){

try{
const localidades= await em.find(Localidad,{})
if(localidades.length!==0){
  return res
          .status(201)
          .json({ message: 'Localidades found succesfully', data: localidades });
}


}
catch(error){
  return res.status(500).json({ message: 'Failed to found Localidades' });


}


    }
  
    export {sanitizeLocalidadInput,add,getAll}