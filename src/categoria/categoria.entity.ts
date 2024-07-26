import crypto from 'node:crypto';
import { ObjectId } from 'mongodb';
export class Categoria {
  constructor(public descripcion: string, public _id?: ObjectId) {}
}
