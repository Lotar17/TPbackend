import crypto from 'node:crypto';

export class Persona {
  constructor(
    public nombre: string,
    public apellido: string,
    public telefono: string,
    public mail: string,
    public id = crypto.randomUUID()
  ) {}
}
