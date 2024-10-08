import { Request, Response, NextFunction, response } from 'express';
import { Producto } from './producto.entity.js';
import { orm } from '../shared/db/orm.js';
import { Categoria } from '../categoria/categoria.entity.js';
import { Persona } from '../persona/persona.entity.js';

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
    categoria: req.body.categoria,
    persona: req.body.personaId
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
    const productos = await em.find(Producto, {});
    return res
      .status(200)
      .json({ message: 'Productos finded', data: productos });
  } catch (error: any) {
    return res.status(404).json({ message: error.message });
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
async function add(req: Request, res: Response) {
  try {
    console.log('Cuerpo de la solicitud:', req.body); // Agregar este log
    const { descripcion,precio,stock, categoria: categoriaNombre, persona:personaId } = req.body.sanitizedInput;
    console.log('Buscando categoría:', categoriaNombre);
    const categoriaentidad = await em.findOne(Categoria, { descripcion: categoriaNombre });
    if (!categoriaentidad) {
      return res.status(400).json({ message: 'Categoría no encontrada' });
    }
    const personaEntity = await em.findOne(Persona, { _id: personaId });
    if (!personaEntity) {
      return res.status(400).json({ message: 'Persona no encontrada' });
    }
    const producto = em.create(Producto, {
      descripcion,
      precio,
      stock,
      categoria: categoriaentidad,
      persona: personaEntity,
    });
    await em.persistAndFlush(producto);
    return res.status(201).json({ message: 'Producto creado exitosamente', data: producto });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}
async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const producto = await em.findOneOrFail(Producto, { id });
    em.assign(producto, req.body.sanitizedInput);
    await em.flush();
    return res
      .status(200)
      .json({ message: 'Producto updated succesfully', data: producto });
  } catch (error: any) {
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
export { sanitizeProductoInput, getAll, getOne, add, update, remove };
