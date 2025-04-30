import { Persona } from './persona.entity.js';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { error } from 'console';
import { Populate } from '@mikro-orm/core';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken'
import { Localidad } from '../localidad/localidad.entity.js';
import { Direccion } from '../direccion/direccion.entity.js';
import dotenv from 'dotenv';

dotenv.config();

const em = orm.em;
export const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY || 'nachovalenlotar'

function sanitizePersonaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    telefono: req.body.telefono,
    mail: req.body.mail,
    prods_publicados: req.body.prods_publicados,
    password: req.body.password ? bcrypt.hashSync(req.body.password, 10) : undefined, // Si en el put o en el patch no se pone un password tira error
    rol: req.body.rol,
    carrito:req.body.carrito,
    direccion:req.body.direccion,
    calle:req.body.calle,
    numero:req.body.numero,
    localidadId:req.body.localidadId
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
      { populate: ['prods_publicados','carrito']
    }
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
      { populate: ['prods_publicados','estados_empleados.seguimiento.cliente.direccion.localidad','estados_empleados.localidad','direccion','compras.direccion'] }
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
    const token = jwt.sign({id: persona.id}, SECRET_JWT_KEY, {expiresIn: '5m'});
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
      <a href="${link}">Hacé clic aqui para restablecer tu contraseña</a><p>El enlace vence en 5 minutos:</p>`,});
    
    return res.status(200).json({ message: 'Correo enviado', data: persona });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Error inesperado', error: error.message });
  }
}


async function add(req: Request, res: Response) {
  try {
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
    } = req.body.sanitizedInput;

    const localidad = await em.findOne(Localidad, { id: localidadId });
    if (!localidad) {
      return res.status(404).json({ message: 'Localidad no encontrada' });
    }

    const direccion = em.create(Direccion, {
      calle,
      numero,
      localidad:localidadId,
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
      direccion:direccion
    })

    await em.persistAndFlush(persona);

    
    return res
      .status(200)
      .json({ message: 'Person Created succesfully !', data: persona });
  } catch (error: any) {
    return res.status(500).json({ message: error.data });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const personaToUpdate = await em.findOneOrFail(Persona, { id });
    em.assign(personaToUpdate, req.body.sanitizedInput);
    await em.flush();
    return res
      .status(200)
      .json({ message: 'Person updated succesfully !', data: personaToUpdate });
  } catch (error: any) {
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

export {
  getAll,
  getOne,
  add,
  update,
  sanitizePersonaInput as sanitizeCharacterInput,
  remove,
  getPersonaByEmail
};
