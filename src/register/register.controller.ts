import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Persona } from '../persona/persona.entity.js';
import { ValidationError } from './registerErrors.js';
import bcrypt from 'bcrypt';
import { Localidad } from '../localidad/localidad.entity.js';
import { Direccion } from '../direccion/direccion.entity.js';
import { Producto } from '../producto/producto.entity.js';
import { Item } from '../item/item.entity.js';
import { z, ZodError } from 'zod';
import { fromError } from 'zod-validation-error';

const em = orm.em;

function sanitizeRegisterInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    telefono: req.body.telefono,
    mail: req.body.mail,
    password: bcrypt.hashSync(req.body.password, 10),
    rol: req.body.rol,
    calle: req.body.calle,
    numero: req.body.numero,
    localidadId: req.body.localidadId,
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}
async function registerUser(req: Request, res: Response) {
  const FormularioAgregarPersona = z.object({
    nombre: z.string().min(1),
    apellido: z.string().min(1),
    telefono: z.string().min(10),
    mail: z.string().email(),
    calle: z.string(),
    numero: z.number(),
    localidadId: z.string(),
    prods_publicados: z.array(z.instanceof(Producto)).optional(),
    password: z.string().min(1),
    carrito: z.array(z.instanceof(Item)).optional(),
  });
  try {
    const parsedInput = FormularioAgregarPersona.parse(req.body.sanitizedInput);
    const {
      nombre,
      apellido,
      telefono,
      mail,
      prods_publicados,
      password,
      carrito,
      calle,
      numero,
      localidadId,
    } = parsedInput;
    console.log('Datos recibidos:', parsedInput); // Para ver los datos recibidos

    const user = await em.findOne(Persona, { mail: mail });
    if (user) throw new ValidationError('El mail ya se encuentra en uso');

    const localidad = await em.findOne(Localidad, { id: localidadId });
    if (!localidad) {
      return res.status(404).json({ message: 'Localidad no encontrada' });
    }

    const direccion = em.create(Direccion, {
      calle,
      numero,
      localidad: localidadId,
    });
    await em.persistAndFlush(direccion);

    const newUser = em.create(Persona, {
      nombre,
      apellido,
      telefono,
      mail,
      prods_publicados,
      password,
      carrito,
      rol: 'Usuario',
      direccion: direccion,
    });

    await em.persistAndFlush(newUser);
    res.status(201).send({ message: 'Registro exitoso', result: true });
  } catch (error) {
    console.error('Error en registro:', error); // Para ver el error
    if (error instanceof ValidationError) {
      res.status(401).send({ message: error.message, result: false });
    } else if (error instanceof ZodError) {
      const validationError = fromError(error);
      console.log(validationError.toString());
      res
        .status(422)
        .send({ message: validationError.toString(), result: false });
    } else {
      res
        .status(500)
        .send({ message: 'Error interno del servidor', result: false });
    }
  }
}

export { sanitizeRegisterInput, registerUser };
