import crypto from 'node:crypto';
import { ObjectId } from 'mongodb';

export class Persona {
  constructor(
    public nombre: string,
    public apellido: string,
    public telefono: string,
    public mail: string,
    public _id?: ObjectId
  ) {}
}
