import {
  Cascade,
  Collection,
  Entity,
  OneToMany,
  Property,
  ManyToOne,
  Rel
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/base-entity.entity.js';
import { Producto } from '../producto/producto.entity.js';
import { Compra } from '../compra/compra.entity.js';
import { Item } from '../item/item.entity.js';
import { Direccion } from '../direccion/direccion.entity.js';
import { EstadoSeguimiento } from '../estado_seguimiento/estado_seguimiento.entity.js';

@Entity()
export class Persona extends BaseEntity {
  @Property({ nullable: false, unique: false })
  nombre!: string;
  @Property({ nullable: false, unique: false })
  apellido!: string;

  @Property({ nullable: true, unique: false })
  telefono?: string;

  @Property({ nullable: true, unique: true })
  mail!: string;

  @Property({ nullable: false })
  rol?: string;

  @OneToMany(() => Compra, (compra) => compra.persona, {
    cascade: [Cascade.ALL],
  })
  compras = new Collection<Compra>(this);

  @OneToMany(() => Producto, (producto) => producto.persona, {
    cascade: [Cascade.ALL],
  })
  prods_publicados = new Collection<Producto>(this);

  @OneToMany(() => Item, (item) => item.persona, {
    cascade: [Cascade.ALL],
  })
  carrito = new Collection<Item>(this);

  @Property({ nullable: false, hidden: true })
  password!: string;

  @OneToMany(() => EstadoSeguimiento, (estado) => estado.empleado, {
    cascade: [Cascade.ALL],
  })
  estados_empleados = new Collection<EstadoSeguimiento>(this);
  
        @ManyToOne(() => Direccion, { nullable: true })
        direccion?: Rel<Direccion>
}
