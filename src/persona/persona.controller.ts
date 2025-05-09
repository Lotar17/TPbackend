import { Persona } from './persona.entity.js';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { error } from 'console';
import { Populate } from '@mikro-orm/core';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { Localidad } from '../localidad/localidad.entity.js';
import { Direccion } from '../direccion/direccion.entity.js';
import { ValidationError } from '../Errores/validationErrors.js';
import { z, ZodError } from 'zod';
import dotenv from 'dotenv';
import { Producto } from '../producto/producto.entity.js';
import { Item } from '../item/item.entity.js';
import { fromError } from 'zod-validation-error';

dotenv.config();

const em = orm.em;
export const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY || 'nachovalenlotar';

function sanitizePersonaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    telefono: req.body.telefono,
    mail: req.body.mail,
    prods_publicados: req.body.prods_publicados,
    password: req.body.password
      ? bcrypt.hashSync(req.body.password, 10)
      : undefined, // Si en el put o en el patch no se pone un password tira error
    passwordAnterior: req.body.passwordAnterior,
    passwordNueva: req.body.passwordNueva
      ? bcrypt.hashSync(req.body.passwordNueva, 10)
      : undefined,
    rol: req.body.rol,
    carrito: req.body.carrito,
    direccion: req.body.direccion,
    calle: req.body.calle,
    numero: req.body.numero,
    localidadId: req.body.localidadId,
    token: req.body.token,
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
    const persona = await em.find(
      Persona,
      {},

      { populate: ['prods_publicados', 'carrito', 'direccion'] }
    );

    return res
      .status(200)
      .json({ message: 'found all persons', data: persona });
  } catch (error: any) {
    return res.status(500).json({ message: error.data });
  }
}

async function getOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const persona = await em.findOneOrFail(
      Persona,
      { id },

      {
        populate: [
          'prods_publicados',
          'estados_empleados.seguimiento.cliente.direccion.localidad',
          'estados_empleados.seguimiento.item.producto.persona.direccion.localidad',
          'estados_empleados.localidad',
          'direccion.localidad',
          'compras.direccion',
          'estados_empleados.seguimiento.item.compra.direccion.localidad',
        ],
      }
    );
    // const { password, ...personaData } = persona;
    return res.status(200).json({ message: 'found person', data: persona });
  } catch (error: any) {
    return res.status(500).json({ message: error.data });
  }
}

async function getPersonaByEmail(req: Request, res: Response) {
  try {
    const email = decodeURIComponent(req.params.email);
    console.log('Email recibido en backend:', email);

    const persona = await em.findOneOrFail(Persona, { mail: email });
    const token = jwt.sign({ id: persona.id }, SECRET_JWT_KEY, {
      expiresIn: '5m',
    });
    const link = `http://localhost:4200/restablecer-contrasena?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Restablecer contraseña',
      text: 'Restablecer contraseña',
      html: `<p>Hola ${persona.nombre},</p>
      <a href="${link}">Hacé clic aqui para restablecer tu contraseña</a><p>El enlace vence en 5 minutos:</p>`,
    });

    return res.status(200).json({ message: 'Correo enviado', data: persona });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Error inesperado', error: error.message });
  }
}

async function add(req: Request, res: Response) {
  const FormularioAgregarPersona = z.object({
    nombre: z.string().min(1),
    apellido: z.string().min(1),
    telefono: z.string().min(10),
    mail: z.string().email(),
    rol: z.union([
      z.literal('Administrador'),
      z.literal('Usuario'),
      z.literal('Empleado'),
    ]),
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
      rol,
      calle,
      numero,
      localidadId,
    } = parsedInput;

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

    const persona = em.create(Persona, {
      nombre,
      apellido,
      telefono,
      mail,
      prods_publicados,
      password,
      carrito,
      rol,
      direccion: direccion,
    });

    await em.persistAndFlush(persona);

    return res
      .status(200)
      .json({ message: 'Person Created succesfully !', data: persona });
  } catch (error: any) {
    if (error instanceof ZodError) {
      const validationError = fromError(error);
      console.log(validationError.toString());
      return res.status(422).json({ message: validationError.toString() });
    }
    return res.status(500).json({ message: error.data });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const personaToUpdate = await em.findOneOrFail(Persona, { id });
    const direccion: Direccion = {
      calle: req.body.sanitizedInput.calle,
      numero: req.body.sanitizedInput.numero,
      localidad: req.body.sanitizedInput.localidadId,
    };
    const direccionExistente = await em.findOne(Direccion, {
      calle: direccion.calle,
      numero: direccion.numero,
      localidad: direccion.localidad,
    });
    if (!direccionExistente) {
      const direccionNueva = em.create(Direccion, direccion);
      personaToUpdate.direccion = direccionNueva;
      await em.persistAndFlush(direccionNueva);
    }
    console.log(req.body.sanitizedInput);
    const mail = req.body.sanitizedInput.mail;

    if (mail !== undefined) {
      const mailRepetido = await em.findOne(Persona, { mail: mail });
      if (mailRepetido && mailRepetido.id !== personaToUpdate.id) {
        throw new ValidationError(
          'No se puede actualizar con un mail ya existente'
        );
      }
    }
    em.assign(personaToUpdate, req.body.sanitizedInput);
    await em.flush();
    return res
      .status(200)
      .json({ message: 'Person updated succesfully !', data: personaToUpdate });
  } catch (error: any) {
    console.log(error);
    if (error instanceof ValidationError) {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: 'error' });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const persona = em.getReference(Persona, id);
    await em.removeAndFlush(persona);
    return res
      .status(200)
      .json({ message: 'Person deleted succesfully !', data: persona });
  } catch (error: any) {
    return res.status(500).json({ message: error.data });
  }
}

async function resetPassword(req: Request, res: Response) {
  try {
    const { token, passwordNueva } = req.body.sanitizedInput;

    console.log(passwordNueva); //quiero ver si esta hasheada aqui por el sanitized

    const payload = jwt.verify(token, SECRET_JWT_KEY) as { id: string };

    const persona = await em.findOneOrFail(Persona, { id: payload.id });
    persona.password = passwordNueva;

    em.persist(persona); // Forzamos que MikroORM lo tome como una entidad a guardar
    await em.flush();

    return res.status(200).json({
      message: 'Contraseña actualizada con exito!',
      data: { id: persona.id, mail: persona.mail },
    });
  } catch (error: any) {
    console.error('Error en resetPassword:', error);
    return res
      .status(500)
      .json({ message: 'Ocurrió un error en el servidor', result: false });
  }
}

async function updatePassword(req: Request, res: Response) {
  try {
    const { mail, passwordAnterior, passwordNueva } = req.body.sanitizedInput;

    const user = await em.findOne(Persona, { mail: mail });
    if (!user) {
      throw new ValidationError('El usuario es incorrecto');
    }

    const isValid = await bcrypt.compare(passwordAnterior, user.password);
    if (!isValid) {
      throw new ValidationError('La contraseña o el usuario es incorrecto');
    }

    user.password = await bcrypt.hash(passwordNueva, 10);
    console.log('Nuevo hash:', user.password);
    em.persist(user); // Forzamos que MikroORM lo tome como una entidad a guardar
    await em.flush();

    return res.status(200).json({
      message: 'Password updated successfully!',
      data: { id: user.id, mail: user.mail },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).send({ message: error.message, result: false });
    } else {
      console.error(error);
      res
        .status(500)
        .send({ message: 'Error interno del servidor', result: false });
    }
  }
}

export {
  getAll,
  getOne,
  add,
  update,
  sanitizePersonaInput as sanitizeCharacterInput,
  remove,
  getPersonaByEmail,
  updatePassword,
  resetPassword,
};
