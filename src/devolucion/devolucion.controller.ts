import { Devolucion } from './devolucion.entity.js';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Item } from '../item/item.entity.js';
import { Producto } from '../producto/producto.entity.js';
import { Persona } from '../persona/persona.entity.js';
import { populate } from 'dotenv';
const em = orm.em;

function sanitizeDevolucionInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    
    item:req.body.item,
    comprador:req.body.comprador,
    vendedor:req.body.vendedor,
    motivo:req.body.motivo,
    estado:req.body.estado,
codigoConfirmacion: req.body.codigoConfirmacion,
fechaSolicitud:req.body.fechaSolicitud,
fechaConfirmacion:req.body.fechaConfirmacion,
cantidad_devuelta:req.body.cantidad_devuelta,
fechaCierre:req.body.fechaCierre,
mensajeCierre:req.body.mensajeCierre
    
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}



async function CreateDevolutionRequest(req: Request, res: Response) {
  try {
    const { itemId, motivo,cantidad_devuelta } = req.body; // Ahora recibimos itemId en lugar de item completo

    if (!itemId || !motivo || !cantidad_devuelta) {
      return res.status(400).json({ message: 'Item,cantidad devuelta y motivo son obligatorios' });
    }

    // Buscar el item en la base de datos
    const item = await em.findOne(Item, { id: itemId }, { populate: ['producto', 'persona','compra','compra.items'] });

    if (!item) {
      return res.status(400).json({ message: 'Item no encontrado' });
    }

    const producto = item.producto;
    const comprador = item.persona;
    const vendedor = producto?.persona;

    if (!comprador || !vendedor) {
      return res.status(400).json({ message: 'Datos del comprador o vendedor no encontrados' });
    }

    if (comprador.id === vendedor.id) {
      return res.status(400).json({ message: 'El comprador y el vendedor no pueden ser la misma persona' });
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

  } catch (error) {
    console.error('Error al crear la solicitud de devolución:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}


async function makeDecission(req:Request, res:Response) {
  try {
    const idSolicitud=req.params.id
  const estado= req.body.estado

  const solicitud= await em.findOne(Devolucion,{id: idSolicitud},{populate:['item']})
  if (!solicitud) {
    return res.status(404).json({ message: "Solicitud de devolución no encontrada" });
  }

if(estado==='Aprobada'){

  solicitud.codigoConfirmacion = Math.floor(Math.random() * 1000000); // Código entre 0 y 999999
 
}
else{
solicitud.codigoConfirmacion=0;

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
  console.error("Error al procesar la decisión:", error);
  return res.status(500).json({ message: "Error interno del servidor" });
}

}


async function getRequestbyVendedor(req:Request, res:Response) {
  try{
const idVendedor= req.params.idVendedor
const solicitudesVendedor= await em.find(Devolucion,{vendedor:idVendedor},{ populate: ['vendedor','item','item.compra.items','item.producto',] })

if (solicitudesVendedor.length === 0) {
  return res.status(404).json({ message: 'No se encontraron solicitudes de devolucion para este vendedor' });
}

return res.status(200).json({
  message: 'Solicitudes del vendedor encontradas',
  data: solicitudesVendedor,
});

  }
  catch(error){
    return res.status(500).json({ message: 'Error al obtener solicitudes del vendedor' });



  }
}
async function getRequestbyComprador(req:Request, res:Response) {
  try{
const idComprador= req.params.idComprador
const solicitudesComprador= await em.find(Devolucion,{comprador:idComprador},{ populate: ['comprador','item','item.compra','item.producto'] })

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

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const devolucionToUpdate = await em.findOneOrFail(Devolucion, { id });
    em.assign(devolucionToUpdate, req.body.sanitizedInput);
    await em.flush();
    return res
      .status(200)
      .json({ message: 'Devolucion updated succesfully !', data: devolucionToUpdate });
  } catch (error: any) {
    return res.status(500).json({ message: 'error' });
  }
}

export { sanitizeDevolucionInput,CreateDevolutionRequest,makeDecission,getRequestbyVendedor,getRequestbyComprador,update };


