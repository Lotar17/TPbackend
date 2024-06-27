import crypto from 'node:crypto';
export class Categoria {
  constructor(public descripcion: string, public id = crypto.randomUUID()) {}
}
