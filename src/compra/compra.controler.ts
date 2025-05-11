import { Request, Response, NextFunction, response } from 'express';
import { Compra } from './compra.entity.js';
import { orm } from '../shared/db/orm.js';
import { ValidationError } from '../Errores/validationErrors.js';
import { Item } from '../item/item.entity.js';
import { Producto } from '../producto/producto.entity.js';
import { HistoricoPrecio } from '../historico_precio/historico_precio.entity.js';
import { populate } from 'dotenv';
import { Persona } from '../persona/persona.entity.js';
import { Direccion } from '../direccion/direccion.entity.js';

const em = orm.em;

function sanitizeCompraInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    direccion_entrega: req.body.direccion_entrega,
    
    fecha_hora_compra: req.body.fecha_hora_compra,

    persona: req.body.persona,
    items:req.body.items,
    total_compra: req.body.total_compra,
    estado: req.body.estado,
    personaId:req.body.personaId,
    direccionId:req.body.direccionId,
    localidadId:req.body.localidadId,
    calle:req.body.calle,
    numero:req.body.numero
  };
  //more checks here
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}


async function getOne(req: Request, res: Response) {//Validado
    try {
      const id = req.params.id;
      const compra = await em.findOneOrFail(
        Compra,
        { id },
        { populate: [ 'persona','items.producto.persona.direccion.localidad','direccion.localidad','items.seguimiento.estados'] }
      );
      return res.status(200).json({ message: 'Compra finded', data: compra });
    } catch (error: any) {
      return res.status(404).json({ message: 'Compra not found' });
    }
  }

  
  async function add(req: Request, res: Response) { // Validado
    try {
      const { personaId, items,direccionId } = req.body.sanitizedInput;
  let direccionExistente
  let localidad
  let calle
  let numero
  let nuevoStock
      console.log('Datos recibidos para la compra:', req.body.sanitizedInput);
  
    
      const personaExistente = await em.findOne(Persona, { id: personaId });
      if (!personaExistente) {
     throw new ValidationError('La persona no se encontro')
      }

       direccionExistente= await em.findOne(Direccion,{id:direccionId},{populate:['localidad']})
      if (!direccionExistente) {

calle=req.body.sanitizedInput.calle
numero=req.body.sanitizedInput.numero
localidad=req.body.sanitizedInput.localidadId
if (typeof calle !== 'string' || calle.trim() === '') {
  throw new ValidationError('Calle no ingresada como string')
}

if (typeof numero !== 'number' || isNaN(numero)) {
  throw new ValidationError('numero no ingresado como tipo number')
}

if(!calle){
  throw new ValidationError('Calle no ingresada')
}
if(!numero){
  throw new ValidationError('Numero no ingresado')
}
if(!localidad){
  throw new ValidationError('Localidad no ingresada')
}


direccionExistente= em.create(Direccion, {
calle:calle,
numero:numero,
localidad:localidad
});
await em.persistAndFlush(direccionExistente);

}
      const fecha_hora_compra= new Date().toISOString()
      const compra = em.create(Compra, {
 
        fecha_hora_compra,
        persona: personaExistente,
        total_compra: 0,
        estado: 'en curso',
        direccion:direccionExistente
        
      });
  
      let totalCompra = 0;
  
      for (const itemData of items) {
        const precioUnitario = itemData.precioUnitario 
        const cantidad_producto = itemData.cantidad_producto;
  
      
        const item = await em.findOne(Item, { id: itemData.id }, { populate: ['producto.persona.direccion.localidad'] });
if(!item){
  throw new ValidationError('El item no existe')
}
if(item.producto.persona.id===personaId){
  throw new ValidationError('La persona que realizo la compra no puede comprar un producto que ella misma publico')
}
   if(item){
    nuevoStock=(item.producto.stock||0)-item.cantidad_producto
    if(nuevoStock<0){
      throw new ValidationError('No hay stock suficiente para realizar la compra')
    }
   }   
  
       
  
        const totalItem = cantidad_producto * precioUnitario;
        totalCompra += totalItem;
  
        item.compra = compra;
        compra.items.add(item); // Ahora sí, es una entidad válida
      
        await em.persistAndFlush(item);
      }
  
      // Asignar el total de la compra antes de guardar
      compra.total_compra = totalCompra;
      await em.persistAndFlush(compra);
  
      return res.status(201).json({ message: 'Compra creada exitosamente', data: compra });
  
    } catch (error: any) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ message: error.message });
      }
  
      console.error('Error al crear la compra:', error);
      return res.status(500).json({ message: error.message });
    }
  }
  

async function getComprasByPersona(req: Request, res: Response) {//Validado
  const personaId = req.params.personaId;
  try {
    const compras = await em.find(
      Compra,
      { persona: personaId },
      { populate: ['items.producto.persona.direccion.localidad','items.persona.direccion.localidad','items.seguimiento.estados','direccion.localidad'] ,}
    );

    // Filtrar compras que tienen items vacíos
    const comprasConItems = compras.filter(compra => compra.items.length > 0);

    if (comprasConItems.length === 0) {
      return res.status(404).json({ message: 'No se encontraron compras con productos' });
    }

    return res.status(200).json({
      message: 'Compras found',
      data: comprasConItems,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener compras', error });
  }
}

  
async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const compra = await em.findOneOrFail(Compra, { id }, { populate: ['items.seguimiento.estados'] });
    let remove = true;


    for (const item of compra.items) {
      if (item.seguimiento?.estados?.length !== 4) {
        remove = false;
        break;
      }
    }

    if (remove) {
      await em.removeAndFlush(compra);
      return res
        .status(200)
        .json({ message: 'Compra deleted successfully', data: compra });
    } else {
      return res
        .status(400)
        .json({ message: 'La compra no puede ser eliminado, tiene items que aun no llegaron' });
    }
  } catch (error: any) {
    return res.status(500).json({ message: 'Compra delete failed' });
  }
}

  async function update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const compra = await em.findOneOrFail(Compra, { id },{ populate: ['items'] });
      em.assign(compra, req.body.sanitizedInput);
      await em.flush();
      return res
        .status(200)
        .json({ message: 'Compra updated succesfully', data: compra });
    } catch (error: any) {
      return res.status(500).json({ message: 'Compra update failed' });
    }
  }
  



  async function updateStock(req: Request, res: Response) { //Validado
    try {
      const idCompra = req.params.id;
  
      
      const compra = await em.findOne(Compra, { id: idCompra }, { populate: ['items.producto'] });
  
      if (!compra) {
        throw new ValidationError('Compra no ingresada')
      }
  
    
  
      if (!compra.items || compra.items.length === 0) {
        throw new ValidationError('Compra sin items')
      }
  
      const productosActualizados: Producto[] = [];
  
      for (const item of compra.items) {
        if (!item.producto || !item.producto.id) {
          throw new ValidationError('El item no tiene un producto valido')
        }
  
        const producto = await em.findOne(Producto, { id: item.producto.id });
  
        if (!producto) {
          throw new ValidationError('Producto no ingresado')
        }
  
       
        const nuevoStock = (producto.stock || 0) - item.cantidad_producto;
        if (nuevoStock < 0) {
          throw new ValidationError('No hay suficiente stock para el producto')
        }
  

        em.assign(producto, { stock: nuevoStock });
        productosActualizados.push(producto);
      }
  
      
      await em.persistAndFlush(productosActualizados);
  
      return res.status(200).json({ message: "Stock actualizado correctamente" });
  
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ message: error.message });
      }
  
      console.error("Error al actualizar stock:", error);
      return res.status(500).json({ message: "Error interno al actualizar stock" });
    }
  }
  
  
   async function getVentasByUser(req: Request, res: Response) {
    try {
      const idUser = req.params.id;
  
      
      const compras = await em.find(Compra, {}, {
        populate: ['items.producto.persona', 'items.persona','items.compra'], 
      });
  
      const items = [];
  
      for (const compra of compras) {
        // Recorres los ítems de la compra
        for (const item of compra.items) {
          // Si el vendedor del producto del ítem es el usuario solicitado
          if (item.producto.persona.id === idUser) {
            items.push(item); // ✅ Pusheás directamente el ítem (no un objeto { item })
          }
        }
      }
      
  
      return res.status(200).json({ data: items });
    } catch (error) {
      console.error("Error al obtener ventas:", error);
      return res.status(500).json({ message: "Error al obtener ventas del usuario" });
    }
  }
  


  export { sanitizeCompraInput,getOne, add,  getComprasByPersona,remove,update,updateStock,getVentasByUser};