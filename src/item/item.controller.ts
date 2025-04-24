import { Item } from './item.entity.js';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Persona} from '../persona/persona.entity.js';
import { Producto } from '../producto/producto.entity.js';
import { HistoricoPrecio } from '../historico_precio/historico_precio.entity.js';
import { ValidationError } from '../Errores/validationErrors.js';
const em = orm.em;

function sanitizeItemInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    
    cantidad_producto: req.body.cantidad_producto,
    precio:req.body.precio,
    producto: req.body.producto,
    persona: req.body.persona,
    compra:req.body.compra,
    cantidad_devuelta:req.body.cantidad_devuelta,
    itemId:req.body.itemId,
    precioUnitario:req.body.precioUnitario
    
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

async function getOne(req:Request, res:Response) {
  
try {
    const id = req.params.id;
    const item = await em.findOneOrFail(
      Item,
      { id },
      { populate: ['producto','producto.persona'] }
    );
    return res.status(200).json({ message: 'item finded', data: item });
  } catch (error: any) {
    return res.status(404).json({ message: 'item not found' });
  }

}

async function validoExistencia(req: Request, res: Response) {//VALIDADO
  try {
    const productoId = req.params.idProducto
    const personaId = req.params.idPersona

    if (!productoId ) {
      throw new ValidationError('El id de producto no llegó');
    }
    if (!personaId ) {
      throw new ValidationError('El id de persona no llegó');
    }


    const item = await em.findOne(Item, {
      producto: productoId,
      persona: personaId,
      compra: null
    });

    // Si no existe, devolvemos null explícitamente sin error
    return res.status(200).json({ message: 'Consulta realizada', data: item || null });

  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }

    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}



    async function remove(req: Request, res: Response) {//Validado
        try {
          const id = req.params.idItem;
          
          const item = em.getReference(Item, id);
          if(!item){
            throw new ValidationError('Item no encontrado')
          }
          await em.removeAndFlush(item);
          return res
            .status(200)
            .json({ message: 'Item deleted succesfully', data: item });
        } catch (error: any) {
          if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
          }
      
          return res.status(500).json({ message: 'Item delete failed' });
        }
      }
    
      async function getCarrito(req: Request, res: Response) { //VALIDADO
        const personaId = req.params.personaId;
      
        try {
          const items = await em.find(
            Item,
            { persona: personaId, compra: null },
            {
              populate: ['producto.hist_precios', 'producto', 'compra', 'producto.persona'],
            }
          );
      
          // Ya no devolvemos 404 si no hay items
          return res.status(200).json({
            message: items.length > 0 ? 'Carrito encontrado' : 'El carrito está vacío',
            data: items,
          });
      
        } catch (error:any) {
          console.error('Error al obtener carrito:', error);
          return res.status(500).json({ message: 'Error al obtener carrito', error: error.message });
        }
      }
      
    
 
      async function decrementQuantity(req: Request, res: Response) { // VALIDADO
       
        try {
          const personaId = req.body.sanitizedInput.persona;
        const productoId= req.body.sanitizedInput.producto

        const persona = await em.findOne(Persona,{id:personaId})
        if(!persona){
          throw new ValidationError('Persona no encontrada')
        }
            
        const producto = await em.findOne(Producto,{id:productoId})
        if(!producto){
          throw new ValidationError('Producto no encontrada')
        }
            let item = await em.findOne(Item, { persona: personaId, producto: productoId,compra:null });
    
            if (!item) {
               throw new ValidationError('Item invalido')
            }
    
           
            if (item.cantidad_producto > 1) {
                item.cantidad_producto -= 1;
            } else {
                
                await em.remove(item); 
            }
    
            
            await em.flush();
    
            res.status(200).json({
                message: item.cantidad_producto > 0 ? 'Cantidad decrementada' : 'Producto eliminado del carrito',
                data: item
            });
        } catch (error) {
          if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
          }
      
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar el carrito', error });
        }
    }
async function createItem(req:Request, res:Response) { //  Validado
  
  try{
  const  personaId = req.body.sanitizedInput.persona;
  const productoId=req.body.sanitizedInput.producto;
  const cantidad_producto=req.body.sanitizedInput.cantidad_producto



  const persona = await em.findOne(Persona, { id: personaId });
  const producto = await em.findOne(Producto, { id: productoId },{populate:['hist_precios']});
  if (!persona || !producto) {
    throw new ValidationError('Persona o producto no encontrados')
  }
  if(producto.stock)
  if(cantidad_producto<=0 || cantidad_producto>producto.stock){
    throw new ValidationError('Cantidad de producto ingresada incorrecta')
  }
  const precioActual = producto.hist_precios
  .getItems()
.sort((a:any, b:any) => new Date(b.fechaDesde).getTime() - new Date(a.fechaDesde).getTime())[0]?.valor;

if(!precioActual){
  throw new ValidationError('Precio actual no encontrado')
}
  let newItem = em.create(Item, {
    persona,
    producto,
    cantidad_producto,
    precioUnitario:precioActual
    
});
await em.persistAndFlush(newItem);
return res.status(200).json({ message: 'Item created successfully', data: newItem });
}
catch (error: any) {
  if (error instanceof ValidationError) {
    return res.status(400).json({ message: error.message });
  }

  console.error(error);
  return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
}

}

async function updateItem(req:Request,res:Response){ // usamos aca
try{
const idItem=req.params.idItem
const cantidad_devuelta=req.body.sanitizedInput.cantidad_devuelta

const item= await em.findOne(Item,{id:idItem})
if(item?.cantidad_producto){
const NuevaCantidad= item?.cantidad_producto - cantidad_devuelta

if(item?.cantidad_producto && item)
em.assign(item,{cantidad_producto:NuevaCantidad})}
await em.flush();

    return res.status(200).json({ message: 'Item updated successfully', data: item });

}
catch(error){
console.error(error);
res.status(500).json({message:'Eerror al actualziar el item',error})



}



}
    
async function addToCart1(req: Request, res: Response) { // VALIDADO
  try {
    const { persona, producto } = req.body.sanitizedInput;

    const personaFound = await em.findOne(Persona, { id: persona });
    const productoFound = await em.findOne(Producto, { id: producto },{populate:['hist_precios']});
    if (!personaFound ) {
      throw new ValidationError('La persona  no se encontro')
      }

      if (!productoFound ) {
        throw new ValidationError('El producto  no se encontro')
        }
    const precioActual = productoFound.hist_precios
    .getItems()
  .sort((a:any, b:any) => new Date(b.fechaDesde).getTime() - new Date(a.fechaDesde).getTime())[0]?.valor;

  if (precioActual === undefined) {
    throw new Error('El producto no tiene precio actual definido');
  }

  

    const existingItem = await em.findOne(Item, { persona: personaFound, producto: productoFound, compra: null });

    if (existingItem) {
      throw new ValidationError('El item ya esta en el carrito')
    }
if(productoFound.stock===0){
  throw new ValidationError('El producto no tiene stock')
}
    const newItem = em.create(Item, {
      persona: personaFound,
      producto: productoFound,
      cantidad_producto: 1,
      precioUnitario: precioActual
    });

    await em.persistAndFlush(newItem);

    res.status(201).json({ message: 'Item agregado al carrito', data: newItem });

  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }
  
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}

async function incrementarCantidad(req: Request, res: Response) { // VALIDADO
  try {
    const itemId = req.body.sanitizedInput.itemId;
    if (!itemId) {
      throw new ValidationError('Item no ingresado');
    }
    const item = await em.findOne(Item, { id: itemId }, { populate: ['producto', 'persona'] });

    if (!item) {
      throw new ValidationError('Item no encontrado');
    }

    const nuevaCantidad = item.cantidad_producto + 1;
    if(!item.producto.stock){
      throw new ValidationError('stock del Producto no encontrado');
    }
if (item.producto.stock === 0 || nuevaCantidad > item.producto.stock) {
  throw new ValidationError('No hay stock disponible');
}

item.cantidad_producto = nuevaCantidad;

    await em.persistAndFlush(item);
    
   

    res.status(200).json({ message: 'Cantidad incrementada', data: item });

  }catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }
  
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}


    
      

      export{sanitizeItemInput,getOne, remove,getCarrito,decrementQuantity,createItem,updateItem,incrementarCantidad,addToCart1,validoExistencia}