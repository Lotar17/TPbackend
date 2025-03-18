import { Request, Response, NextFunction, response } from 'express';
import { Producto } from './producto.entity.js';
import { orm } from '../shared/db/orm.js';
import { HistoricoPrecio } from '../historico_precio/historico_precio.entity.js';
import { ObjectId } from '@mikro-orm/mongodb';

const em = orm.em;

function sanitizeProductoInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    id:req.body.id,
    descripcion: req.body.descripcion,
    precio: req.body.precio,
    stock: req.body.stock,
    categoria: req.body.categoriaId,
    persona: req.body.personaId,

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
    try {
      const descripcion = req.query.descripcion as string;
  
      let productos;
  
      if (descripcion) {
        // Si se proporciona una descripción, buscar productos que coincidan parcialmente
        productos = await em.find(
          Producto,
          {
            descripcion: new RegExp(descripcion, 'i')// Coincidencia parcial, insensible a mayúsculas/minúsculas
          },
          {
            populate: ['persona', 'categoria', 'hist_precios'],
          }
        );
      } else {
        // Si no se proporciona descripción, devolver todos los productos
        productos = await em.find(
          Producto,
          {},
          {
            populate: ['persona', 'categoria', 'hist_precios'],
          }
        );
      }
  
      return res.status(200).json({ message: 'Productos encontrados', data: productos });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error al buscar productos', error: error.message });
    }
  }
  

async function getOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const producto = await em.findOneOrFail(
      Producto,
      { id },
      { populate: ['categoria', 'hist_precios'] }
    );
    return res.status(200).json({ message: 'Producto finded', data: producto });
  } catch (error: any) {
    return res.status(404).json({ message: 'Producto not found' });
  }
}

async function getbydescription(req:Request,res:Response){
  try{
    const descripcion = req.query.descripcion as string;
    if(descripcion){
    const producto = em.findOneOrFail(Producto,descripcion)
    return res.status(200).json({ message: 'Productos found', data: producto });
    }
  }
  catch (error: any) {
    console.error(error);
    return res.status(404).json({ message: 'Error al buscar productos' });
  }
}

async function add(req: Request, res: Response) {
  try {
    console.log(req.body.sanitizedInput);
    const precio = req.body.sanitizedInput.precio;
    delete req.body.sanitizedInput.precio;
    const producto = em.create(Producto, req.body.sanitizedInput);
    const histPrecio: HistoricoPrecio = {
      valor: precio,
      fechaDesde: new Date(),
      producto: producto,
    };
    const historicoPrecioNuevo = em.create(HistoricoPrecio, histPrecio);
    await em.flush();
    res.status(201).send({ message: 'Registro exitoso', result: true });
  } catch (error: any) {
    res.status(500).send({ message: 'Error interno del servidor', result: false })
  }
}
async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;

    // Encuentra el producto por su ID, incluyendo su historial de precios
    const producto = await em.findOneOrFail(
      Producto,
      { id },
      { populate: ['hist_precios'] }
    );

    // Actualizar el producto con los campos enviados en el cuerpo de la solicitud (parciales)
    const sanitizedInput = req.body.sanitizedInput;
    em.assign(producto, sanitizedInput);  // Asigna de forma parcial lo que se pasa en sanitizedInput

    // Si el precio está siendo actualizado, maneja el historial de precios
    if (sanitizedInput.precio !== undefined) {
      const precioExiste = producto.hist_precios.find(
        (precio) => precio.valor === sanitizedInput.precio
      );
      
      // Si ya existe ese precio, actualiza la fecha
      if (precioExiste) {
        const idPrecio = precioExiste.id;
        const precio = await em.findOneOrFail(HistoricoPrecio, { id: idPrecio });
        em.assign(precio, { fechaDesde: new Date() });
      } else {
        // Si no existe ese precio, crea un nuevo historial de precio
        const precio: HistoricoPrecio = {
          valor: sanitizedInput.precio,
          fechaDesde: new Date(),
          producto: producto,
        };
        em.create(HistoricoPrecio, precio);
      }
    }

    // Persiste todos los cambios
    await em.flush();

    return res.status(200).json({ message: 'Producto updated successfully', data: producto });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: 'Producto update failed' });
  }
}


async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const producto = em.getReference(Producto, id);
    await em.removeAndFlush(producto);
    return res
      .status(200)
      .json({ message: 'Producto deleted succesfully', data: producto });
  } catch (error: any) {
    return res.status(500).json({ message: 'Producto delete failed' });
  }
}
async function actualizarStock(req: Request, res: Response) {
  try {
    console.log("✅ Body recibido en el backend:");
    console.log(JSON.stringify(req.body, null, 2)); // Verifica qué datos llegan

    if (!Array.isArray(req.body)) {
      return res.status(400).json({ message: "El formato de datos es incorrecto, debe ser un array de productos." });
    }

    for (const productoData of req.body) {
      console.log("🔹 Procesando producto:", productoData);

      if (!productoData.id) {
        console.error("🚨 ERROR: Producto sin ID", productoData);
        return res.status(400).json({ message: "Cada producto debe incluir un ID para actualizarlo." });
      }

      const producto = await em.findOne(Producto, { _id: new ObjectId(productoData.id) });

      if (!producto) {
        console.error("⚠ Producto no encontrado con ID:", productoData.id);
        return res.status(404).json({ message: `Producto con ID ${productoData.id} no encontrado` });
      }

      console.log(`✅ Producto encontrado (${productoData.id}), actualizando stock...`);
      em.assign(producto, { stock: productoData.stock });
      em.persist(producto);
    }

    await em.flush();
    res.status(200).json({ message: "Stock actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar stock:", error);
    res.status(500).json({ message: "Error al actualizar stock" });
  }
}

async function getProductsByUser(req:Request, res:Response) {
  try { const idUser=req.params.idPersona
  const productos= await em.find(Producto,{
    persona:idUser
  }

  )
  
  if (productos.length === 0) {
    return res.status(404).json({ message: 'No se encontraron productos para ese usuario' });
  }
  return res.status(200).json({
    message: 'Productos para el usuario encontrados',
    data: productos,
  });
  
}catch(error){
  return res.status(500).json({ message: 'Error al obtener productos' });

}
}



export { sanitizeProductoInput,getbydescription, getAll, getOne,actualizarStock, add, update, remove,getProductsByUser};