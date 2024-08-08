import {
  Cascade,
  Collection,
  Entity,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/base-entity.entity.js';
import { Producto } from '../producto/producto.entity.js';

@Entity()
export class Categoria extends BaseEntity {
  @Property({ nullable: false, unique: true })
  descripcion!: string;

  @OneToMany(() => Producto, (producto) => producto.categoria, {
    cascade: [Cascade.ALL],
  })
  productos = new Collection<Producto>(this);
}
