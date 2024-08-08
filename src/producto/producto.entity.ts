import {
  Cascade,
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
  Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/base-entity.entity.js';
import { Categoria } from '../categoria/categoria.entity.js';
import { HistoricoPrecio } from '../historico_precio/historico_precio.entity.js';

@Entity()
export class Producto extends BaseEntity {
  @Property({ nullable: false, unique: true })
  descripcion!: string;

  @Property()
  stock?: number;

  @ManyToOne(() => Categoria, { nullable: false })
  categoria!: Categoria;

  @OneToMany(
    () => HistoricoPrecio,
    (historico_precio) => historico_precio.producto,
    { cascade: [Cascade.ALL] }
  )
  precios = new Collection<HistoricoPrecio>(this);
}
