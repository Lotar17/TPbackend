
import crypto from 'node:crypto';
import { ObjectId } from 'mongodb';

export class Empleado {
  constructor(
    public nombre: string,
    public apellido: string,
    public telefono: string,
    public mail: string,
    public rol: string,
    public nro_legajo: string,
    public _id ?: ObjectId
  ) {}
}