import { Item } from './item.entity.js';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Persona} from '../persona/persona.entity.js';
import { Producto } from '../producto/producto.entity.js';
import { HistoricoPrecio } from '../historico_precio/historico_precio.entity.js';
const em = orm.em;

function sanitizeItemInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    
    cantidad_producto: req.body.cantidad_producto,
    precio:req.body.precio,
    producto: req.body.producto,
    persona: req.body.persona,
    compra:req.body.compra
    
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

  


    async function remove(req: Request, res: Response) {
        try {
          const id = req.params.idItem;
          const item = em.getReference(Item, id);
          await em.removeAndFlush(item);
          return res
            .status(200)
            .json({ message: 'Item deleted succesfully', data: item });
        } catch (error: any) {
          return res.status(500).json({ message: 'Item delete failed' });
        }
      }
    
      async function getCarrito(req: Request, res: Response) {
        const personaId = req.params.personaId;
        try {
            
            const items = await em.find(Item, { persona: personaId,compra:null }, { populate: ['producto.hist_precios','producto','compra','producto.persona'] });
    
            
            if (items.length === 0) {
                return res.status(404).json({ message: 'Carrito no encontrado' });
            }
            
         
           
    
            return res.status(200).json({
                message: 'Carrito encontrado',
                data: items,
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error al obtener carrito', error });
        }
    }
    
      async function addToCart(req: Request, res: Response) {
        try {
          const  personaId = req.body.sanitizedInput.persona;
          const productoId=req.body.sanitizedInput.producto;
         
          
          const persona = await em.findOne(Persona, { id: personaId },);
          const producto = await em.findOne(Producto, { id: productoId });
      
          if (!persona || !producto) {
            return res.status(404).json({ message: 'Persona o producto no encontrado' });
          }
      
          
          let item= await em.findOne(Item, { persona, producto, compra :null });

if (item) {
  
    item.cantidad_producto += 1;
    await em.persistAndFlush(item);
} else {
    
    let newItem = em.create(Item, {
        persona,
        producto,
        cantidad_producto: 1,
        
    });
    await em.persistAndFlush(newItem);
}
      
          await em.flush();
          res.status(200).json({ message: 'Producto agregado al carrito', data:item });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Error interno del servidor' });
        }
      }
      async function decrementQuantity(req: Request, res: Response) {
        const personaId = req.body.sanitizedInput.persona;
        const productoId= req.body.sanitizedInput.producto
        try {
            
            let item = await em.findOne(Item, { persona: personaId, producto: productoId,compra:null });
    
            if (!item) {
                return res.status(404).json({ message: 'Item no encontrado en el carrito' });
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
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar el carrito', error });
        }
    }
async function createItem(req:Request, res:Response) {
  
  try{
  const  personaId = req.body.sanitizedInput.persona;
  const productoId=req.body.sanitizedInput.producto;
  const cantidad_producto=req.body.sanitizedInput.cantidad_producto

  const persona = await em.findOne(Persona, { id: personaId });
  const producto = await em.findOne(Producto, { id: productoId });
  if (!persona || !producto) {
    return res.status(404).json({ message: 'Persona o producto no encontrado' });
  }

  let newItem = em.create(Item, {
    persona,
    producto,
    cantidad_producto,
    
});
await em.persistAndFlush(newItem);
return res.status(200).json({ message: 'Producto updated successfully', data: newItem });
}
catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Error al actualizar el carrito', error });
}

}

async function updateItem(req:Request,res:Response){
try{
const idItem=req.params.idItem
const cantidad_devuelta=req.body.cantidad_devuelta

const item= await em.findOne(Item,{id:idItem})
if(item?.cantidad_producto){
const NuevaCantidad= item?.cantidad_producto - cantidad_devuelta

if(item?.cantidad_producto && item)
em.assign(item,{cantidad_producto:NuevaCantidad})}
await em.flush();

    return res.status(200).json({ message: 'Producto updated successfully', data: item });

}
catch(error){
console.error(error);
res.status(500).json({message:'Eerror al actualziar el item',error})



}



}
    



    
      

      export{sanitizeItemInput,addToCart,getOne, remove,getCarrito,decrementQuantity,createItem,updateItem}