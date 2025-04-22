import { Entity, ManyToOne, OneToOne, Property, Rel } from '@mikro-orm/core';
import { BaseEntity } from '../shared/base-entity.entity.js';
import { Producto } from '../producto/producto.entity.js';
import { Compra } from '../compra/compra.entity.js';
import { Persona } from '../persona/persona.entity.js';
import { compare } from 'bcrypt';
import { Devolucion } from '../devolucion/devolucion.entity.js';
import { Seguimiento } from '../seguimiento/seguimiento.entity.js';

@Entity()
export class Item extends BaseEntity {
  @Property({ nullable: true })
  cantidad_producto!: number;

  @Property({ nullable: true })
  precioUnitario?: number;


  @ManyToOne(() => Producto, { nullable: false })
  producto!: Rel<Producto>;

  @ManyToOne(() => Compra, { nullable: true })
  compra?: Rel<Compra>;
  
  @OneToOne(() => Devolucion, devolucion => devolucion.item, { nullable: true })
  devolucion?: Rel<Devolucion>;
  
  @ManyToOne(() => Persona, { nullable: false })
  persona!: Rel<Persona>;

  @OneToOne(()=>Seguimiento,{nullable:true})
  seguimiento?: Rel<Seguimiento>

}

