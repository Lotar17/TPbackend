import { Seguimiento } from './seguimiento.entity.js';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Compra } from '../compra/compra.entity.js';
import { Persona } from '../persona/persona.entity.js';
import { Item } from '../item/item.entity.js';
import { ValidationError } from '../Errores/validationErrors.js';
const em = orm.em;

function sanitizeSeguimientoInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
      
      codigoSeguimiento: req.body.codigoSeguimiento,
      calificacionServicio:req.body.calificacionServicio,
      estados: req.body.estados,
      compra: req.body.compra,
  cliente:req.body.cliente,
      item:req.body.item
    };
  
    Object.keys(req.body.sanitizedInput).forEach((key) => {
      if (req.body.sanitizedInput[key] === undefined) {
        delete req.body.sanitizedInput[key];
      }
    });
  
    next();
  }

   async function  add(req:Request, res:Response){ // Validado
try{

  const idCliente=req.body.sanitizedInput.cliente
  const cliente = await em.findOne(Persona, { id: idCliente },{populate:['direccion']});
  if(!cliente){
    throw new ValidationError('El cliente no se encontro')
  }
    const  idItem = req.body.sanitizedInput.item;
     const item = await em.findOne(Item, { id: idItem },{populate:['producto.persona.direccion']});
if(!item){
  throw new ValidationError('El item no se encontro')
}
     const codigoSeguimiento= Math.random()


     const seguimiento=em.create(Seguimiento,{
codigoSeguimiento,
item,
cliente
  })
  item.seguimiento=seguimiento 
  await em.persistAndFlush(seguimiento);
  await em.persistAndFlush(item);
  return res.status(200).json({ message: 'Seguimiento creado', data: seguimiento });
  }
  catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }

    console.error(error);
    res.status(500).json({ message: 'Error al crear Seguimiento', error });
  }




}
async function muestraEstados(req:Request,res:Response){ //Ver como usarlo
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

async function getSeguimientosbyClient(req:Request, res:Response){
  try{
  const clienteId=req.params.idCliente

  const seguimientosCliente = await em.find(Seguimiento, {cliente:clienteId}, {
    populate: ['estados.localidad','cliente','item','item.producto.persona','estados.empleado']
  });
  

  
  return res.status(200).json({
    message: 'Estados encontrados',
    data: seguimientosCliente,
  });
  
  
    
  }
  catch(error){
  
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
  
    }

   
   export {sanitizeSeguimientoInput,add,muestraEstados,getSeguimientosbyClient}