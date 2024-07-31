import { Persona} from './persona.entity.js';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { error } from 'console';

const em = orm.em;

function sanitizePersonaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    telefono: req.body.telefono,
    mail: req.body.mail,
  };
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

async function getAll(req: Request, res: Response) {
  try{ 
    const persona = await em.find(Persona,{})
    res.status(200).json({message:'found persons',data:persona})

  }
  catch(error: any){ res.status(500).json({message : error.data}) }
}

async function getOne(req: Request, res: Response) {
  try{
    const id = req.params.id
    const persona = await em.findOneOrFail(Persona,{id})
    res.status(200).json({message:'found person',data:persona})
  }
  catch(error:any){
    res.status(500).json({message : error.data})
  }
}

async function add(req: Request, res: Response) {
  try{
    const persona = em.create(Persona,req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({message:'Person Created succesfully !',data:persona})
  }
  catch(error:any){

  }
}

async function update(req: Request, res: Response) {
  try{
    const id = req.params.id
    const persona = em.getReference(Persona,id)
    em.assign(persona,req.body)
    await em.flush()
    res.status(200).json({message:'Person updated succesfully !',data:persona})
  }
  catch(error:any){
    res.status(500).json({message : error.data})
  }
}

async function remove(req: Request, res: Response) {
  try{
    const id = req.params.id
    const persona = em.getReference(Persona,id)
    await em.removeAndFlush(persona)
    res.status(200).json({message:'Person deleted succesfully !',data:persona})
  }
  catch(error:any){
    res.status(500).json({message : error.data})
  }
} 

export {
  getAll,
  getOne,
  add,
  update,
  sanitizePersonaInput as sanitizeCharacterInput,
  remove,
};
