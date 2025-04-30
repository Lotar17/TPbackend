import { Devolucion } from './devolucion.entity.js';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Item } from '../item/item.entity.js';
import { ValidationError } from '../Errores/validationErrors.js';
const em = orm.em;

function sanitizeDevolucionInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    
    item:req.body.item,
    itemId:req.body.itemId,
    comprador:req.body.comprador,
    vendedor:req.body.vendedor,
    motivo:req.body.motivo,
    estado:req.body.estado,
codigoConfirmacion: req.body.codigoConfirmacion,
fechaSolicitud:req.body.fechaSolicitud,
fechaConfirmacion:req.body.fechaConfirmacion,
cantidad_devuelta:req.body.cantidad_devuelta,
fechaEnvioCliente:req.body.fechaEnvioCliente,
fechaCierre:req.body.fechaCierre,
mensajeCierre:req.body.mensajeCierre,
cantidadAactualizar:req.body.cantidadAactualizar
    
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}



async function CreateDevolutionRequest(req: Request, res: Response) { //Validado
  try {    
    let fechaCompraDate     
    let diferenciaTiempo    
    let diferenciaDias                                                  
    const { itemId, motivo,cantidad_devuelta } = req.body.sanitizedInput; 

    
  if (typeof cantidad_devuelta !== 'number' || isNaN(cantidad_devuelta)) {
    throw new ValidationError('cantidad_devuelta no ingresado como tipo number')
  }

  if (typeof motivo !== 'string' || motivo === '') {
    throw new ValidationError('Motivo no ingresado, o no se ingreso como string')
  }

    if (!itemId || !motivo || !cantidad_devuelta) {
throw new ValidationError('El item, motivo y cantidad a devolver son obligatorios')
    }

    // Buscar el item en la base de datos
    const item = await em.findOne(Item, { id: itemId }, { populate: ['producto', 'persona','compra','compra.items','producto.persona','seguimiento.estados'] });

    if (!item) {
      throw new ValidationError('El item no se encontro')
    }
    const fechaActual = new Date();
    if(item.compra?.fecha_hora_compra)
     fechaCompraDate = new Date(item.compra?.fecha_hora_compra);
    
    if(fechaCompraDate)
   
     diferenciaTiempo = fechaActual.getTime() - fechaCompraDate.getTime();
    if(diferenciaTiempo)
    
     diferenciaDias = diferenciaTiempo / (1000 * 60 * 60 * 24);
  
    if(diferenciaDias)
    
    if (diferenciaDias>30){
throw new ValidationError('La compra se realizo fuera del plazo de 30 dias de devolucion')
    }


  
if(cantidad_devuelta> item.cantidad_producto || cantidad_devuelta<=0){
  throw new ValidationError('No se puede devolver una cantidad mayor a la que tengo o la cantidad debe ser positiva')
}

    if(item.seguimiento)
    
    if(item.seguimiento.estados.length !==4){
throw new ValidationError('No se puede realizar una devolucion de una compra que todavia no se materializo')

    }
  
    const producto = item.producto;
    const comprador = item.persona;
    const vendedor = producto?.persona;

    if (!comprador || !vendedor) {
      throw new ValidationError('El comprador o vendedor no se encontraron')
    }

    if (comprador.id === vendedor.id) {
      throw new ValidationError('El comprador y vendedor no pueden ser la misma persona')
    }

    const fechaSolicitud = new Date().toISOString();

    // Crear la devolución referenciando el item existente
    const solicitud = em.create(Devolucion, {
      item,  
      motivo,
      comprador,
      vendedor,
      estado: 'pendiente',
      codigoConfirmacion: 0,
      fechaSolicitud,
      fechaConfirmacion: null,
      cantidad_devuelta
    });

    await em.persistAndFlush(solicitud);

    return res.status(200).json({
      message: 'Solicitud de devolución creada correctamente',
      solicitudId: solicitud.id,
      data:solicitud
    });

  } 
    catch (error: any) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ message: error.message });
      }
  
    console.error('Error al crear la solicitud de devolución:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}


async function makeDecission(req:Request, res:Response) {//Validado
  try {
    const idSolicitud=req.params.id
  const estado= req.body.sanitizedInput.estado

  if(!estado){
    throw new ValidationError('Ingresar el estado ')
  }



  const solicitud= await em.findOne(Devolucion,{id: idSolicitud},{populate:['item']})
  if (!solicitud) {
   throw new ValidationError('Solicitud devolucion no encontrada')
  }

if(estado==='Aprobada'){

  solicitud.codigoConfirmacion = Math.floor(Math.random() * 1000000); // Código entre 0 y 999999
 
}
else{
solicitud.codigoConfirmacion=0; // esto es si el estado ingresado es rechazada

}
solicitud.estado=estado;
solicitud.fechaConfirmacion=new Date().toISOString();
await em.persistAndFlush(solicitud);
return res.status(200).json({
  message: `Solicitud de devolución ${estado} correctamente`,
  solicitudId: solicitud.id,
  codigo: solicitud.codigoConfirmacion,
  data:solicitud
});


}
catch (error) {
  if (error instanceof ValidationError) {
    return res.status(400).json({ message: error.message });
  }

  console.error("Error al procesar la decisión:", error);
  return res.status(500).json({ message: "Error interno del servidor" });
}

}


async function getRequestbyVendedor(req:Request, res:Response) {//Validado
  try{
const idVendedor= req.params.idVendedor
const solicitudesVendedor = await em.find(Devolucion, { vendedor: idVendedor }, { populate: ['item.producto','item.compra.items','item.persona','comprador'] });
//,'item.compra.items','item.producto','comprador'



return res.status(200).json({
  message: 'Solicitudes del vendedor encontradas',
  data: solicitudesVendedor,
});

  }
  catch(error){
    return res.status(500).json({ message: 'Error al obtener solicitudes del vendedor' });



  }
}
async function getRequestbyComprador(req:Request, res:Response) {//Validado
  try{
const idComprador= req.params.idComprador
const solicitudesComprador= await em.find(Devolucion,{comprador:idComprador},{ populate: ['comprador','item','item.compra','item.producto','vendedor.direccion.localidad'] })

if (solicitudesComprador.length === 0) {
  return res.status(404).json({ message: 'No se encontraron solicitudes de devolucion para este vendedor' });
}

return res.status(200).json({
  message: 'Solicitudes del vendedor encontradas',
  data: solicitudesComprador,
});

  }
  catch(error){
    return res.status(500).json({ message: 'Error al obtener solicitudes del vendedor' });



  }
}

async function update(req: Request, res: Response) {//Validado
  try {
    const id = req.params.id;
    
    const devolucionToUpdate = await em.findOne(Devolucion, { id });
    console.log(req.body.sanitizedInput)
    if(!devolucionToUpdate){
      throw new ValidationError('No se encontro devolucion con ese id')
    }
    em.assign(devolucionToUpdate, req.body.sanitizedInput);
    await em.flush();
    return res
      .status(200)
      .json({ message: 'Devolucion updated succesfully !', data: devolucionToUpdate });
  } catch (error: any) {
    return res.status(500).json({ message: 'error' });
  }
}
async function validoCantidad(req:Request, res:Response){ // valida la cantidad de stock a actualizar si el vendedor lo requiere
  try{
const {cantidad_devuelta,cantidadAactualizar}=req.body.sanitizedInput

if(cantidadAactualizar>cantidad_devuelta || cantidadAactualizar <= 0){
  throw new ValidationError('No se puede actualizar el stock con mayor cantidad a la devuelta o cantidad devuelta menor igual a 0')
}
return res
      .status(200)
      .json({ message: 'Devolucion updated succesfully !', data: true });

}
catch(error){
  if (error instanceof ValidationError) {
    return res.status(400).json({ message: error.message });
  }
  else{
    return res.status(500).json({ message: 'error' });
  }
}

}
async function validoPendientes(req:Request, res:Response) {
 try{ 
  console.log('Dentro del try')
  const idItem = req.body.sanitizedInput.itemId;
  console.log('Id del item')


 
const devolucionExistente= await em.findOne(Devolucion,{
  item:idItem,
  estado:'pendiente'
})
console.log('Devolucion',devolucionExistente)
if (devolucionExistente) {
  throw new ValidationError('Ya existe una solicitud de devolución pendiente para este ítem.');
  }
  return res
      .status(200)
      .json({ message: 'Devolucion updated succesfully !', data: true });

}
catch(error){
  if (error instanceof ValidationError) {
    return res.status(400).json({ message: error.message });
  }
  else{
    return res.status(500).json({ message: 'error' });
  }

}
}
async function validaActualizacion(req:Request, res: Response){

try{
  const idSolicitud= req.params.idSolicitud

  const solicitud = await em.findOne(Devolucion,{id:idSolicitud,actualizada:true})

  if(solicitud){
    throw new ValidationError('El stock del producto asociado a la solicitud ya fue actualizado')
  }
  return res
  .status(200)
  .json({ message: 'La solicitud no se actualizo !', data: true });


}
catch(error){
  if (error instanceof ValidationError) {
    return res.status(400).json({ message: error.message });
  }
  else{
    return res.status(500).json({ message: 'error' });
  }

}

}

export { sanitizeDevolucionInput,CreateDevolutionRequest,makeDecission,getRequestbyVendedor,getRequestbyComprador,update,validoCantidad,validoPendientes };


