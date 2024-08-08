import { Entity, ManyToOne, Property, Rel } from '@mikro-orm/core';
import { BaseEntity } from '../shared/base-entity.entity.js';
import { Producto } from '../producto/producto.entity.js';

@Entity()
export class HistoricoPrecio extends BaseEntity {
  @Property({ nullable: false })
  valor!: number;
  
  @Property({ nullable: false })
  fechaDesde!: Date;

  @ManyToOne(() => Producto, { nullable: false })
  producto!: Rel<Producto>;
}
