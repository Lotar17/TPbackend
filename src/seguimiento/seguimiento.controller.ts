import { Seguimiento } from './seguimiento.entity.js';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Compra } from '../compra/compra.entity.js';

const em = orm.em;

function sanitizeSeguimientoInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
      
      codigoSeguimiento: req.body.codigoSeguimiento,
      calificacionServicio:req.body.calificacionServicio,
      estados: req.body.estados,
      compra: req.body.compra,
  
      
    };
  
    Object.keys(req.body.sanitizedInput).forEach((key) => {
      if (req.body.sanitizedInput[key] === undefined) {
        delete req.body.sanitizedInput[key];
      }
    });
  
    next();
  }

   async function  add(req:Request, res:Response){
try{
    const  idcompra = req.body.sanitizedInput.compra;
     const compra = await em.findOne(Compra, { id: idcompra });

     const codigoSeguimiento= Math.random()
if(!compra){
    return res.status(404).json({ message: 'Compra no encontrada' });
}
     const seguimiento=em.create(Seguimiento,{
codigoSeguimiento,
compra
  })
  await em.persistAndFlush(seguimiento);
  return res.status(200).json({ message: 'Seguimiento creado', data: seguimiento });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear Seguimiento', error });
  }




}
async function muestraEstados(req:Request,res:Response){
try{
const codigo_seguimiento=req.body.sanitizedInput.codigoSeguimiento

const estados= await em.find(Seguimiento,{codigoSeguimiento:codigo_seguimiento})
if (estados.length === 0) {
  return res.status(404).json({ message: 'Estados no encontrados' });
}
return res.status(200).json({
  message: 'Estados encontrados',
  data: estados,
});

}
catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Error interno del servidor' });
}


}



   
   export {sanitizeSeguimientoInput,add}