import { Request, Response, NextFunction, response } from 'express';
import { Producto } from './producto.entity.js';
import { orm } from '../shared/db/orm.js';
import { HistoricoPrecio } from '../historico_precio/historico_precio.entity.js';

const em = orm.em;

function sanitizeProductoInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
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
    const producto = await em.findOneOrFail(
      Producto,
      { id },
      { populate: ['hist_precios'] }
    );
    const precioExiste = producto.hist_precios.find(
      (precio) => precio.valor === req.body.sanitizedInput.precio
    );
    em.assign(producto, req.body.sanitizedInput);
    if (precioExiste) {
      const idPrecio = precioExiste.id;
      const precio = await em.findOneOrFail(HistoricoPrecio, { id: idPrecio });
      em.assign(precio, { fechaDesde: new Date() });
    } else {
      const precio: HistoricoPrecio = {
        valor: req.body.sanitizedInput.precio,
        fechaDesde: new Date(),
        producto: producto,
      };
      em.create(HistoricoPrecio, precio);
    }
    await em.flush();
    return res
      .status(200)
      .json({ message: 'Producto updated succesfully', data: producto });
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
export { sanitizeProductoInput,getbydescription, getAll, getOne, add, update, remove };
