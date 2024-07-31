import crypto from 'node:crypto';

export class Empleado {
  constructor(
    public nombre: string,
    public apellido: string,
    public telefono: string,
    public mail: string,
    public rol: string,
    public nro_legajo: string
  ) {}
}
