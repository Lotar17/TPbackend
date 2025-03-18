import { Devolucion } from './devolucion.entity.js';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Item } from '../item/item.entity.js';
import { Producto } from '../producto/producto.entity.js';
import { Persona } from '../persona/persona.entity.js';
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
fechaConfirmacion:req.body.fechaConfirmacion
    
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
    // Obtenemos el item y el motivo desde el cuerpo de la solicitud
    const item = req.body.item;
    const motivo = req.body.motivo;

  
    // Validamos que el item exista y tenga los datos necesarios
    if (!item || !item.persona || !item.producto) {
      return res.status(400).json({ message: 'Item o datos incompletos' });
    }

    // Validamos que el motivo de la devolución esté presente
    if (!motivo) {
      return res.status(400).json({ message: 'Motivo de devolución es obligatorio' });
    }

    const producto = await em.findOne(Producto, { id: item.producto });
const persona = await em.findOne(Persona, { id: item.persona });


    const comprador = persona;
    const vendedor = producto?.persona;
    if (!comprador || !vendedor) {
      return res.status(400).json({ message: 'Item o datos incompletos' });
    }


    // Verificar que el comprador y el vendedor no sean los mismos
    if (comprador.id === vendedor.id) {
      return res.status(400).json({ message: 'El comprador y el vendedor no pueden ser la misma persona' });
    }

   


    

    
    const fechaSolicitud = new Date().toISOString();

    // Creamos la solicitud de devolución
    const solicitud = em.create(Devolucion, {
      item,  // Solo un ítem por solicitud
      motivo,
      comprador,
      vendedor,
      estado: 'pendiente',
      codigoConfirmacion:0,
      fechaSolicitud,
      fechaConfirmacion:null
    });

    await em.persistAndFlush(solicitud);

    // Notificar al vendedor (puedes hacerlo con un WebSocket o un sistema de notificaciones)
    // Aquí puedes agregar la lógica de notificación a través de correo electrónico o WebSocket si es necesario
    // Nota: Esto es solo un ejemplo, necesitas tener una forma de notificar al vendedor

    // Respuesta de éxito
    return res.status(201).json({
      message: 'Solicitud de devolución creada correctamente',
      solicitudId: solicitud.id, // O el identificador único que uses para las solicitudes
      // Devolvemos el código de confirmación al comprador
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

  const solicitud= await em.findOne(Devolucion,{id: idSolicitud})
  if (!solicitud) {
    return res.status(404).json({ message: "Solicitud de devolución no encontrada" });
  }

if(estado==='Codigo Enviado'){

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
  codigo: solicitud.codigoConfirmacion
});


}
catch (error) {
  console.error("Error al procesar la decisión:", error);
  return res.status(500).json({ message: "Error interno del servidor" });
}

}
async function buyerDecission(req:Request, res:Response) {
  try{
    


  }
  catch{


  }
}

export { sanitizeDevolucionInput,CreateDevolutionRequest,makeDecission };


