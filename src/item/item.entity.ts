import { Entity, ManyToOne, OneToOne, Property, Rel } from '@mikro-orm/core';
import { BaseEntity } from '../shared/base-entity.entity.js';
import { Producto } from '../producto/producto.entity.js';
import { Compra } from '../compra/compra.entity.js';
import { Persona } from '../persona/persona.entity.js';
import { compare } from 'bcrypt';

@Entity()
export class Item extends BaseEntity {
  @Property({ nullable: true })
  cantidad_producto!: number;



  @ManyToOne(() => Producto, { nullable: false })
  producto!: Rel<Producto>;

  @ManyToOne(() => Compra, { nullable: true })
  compra?: Rel<Compra>;
 

  @ManyToOne(() => Persona, { nullable: false })
  persona!: Rel<Persona>;

}

