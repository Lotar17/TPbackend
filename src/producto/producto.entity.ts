import {
  Cascade,
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
  QueryOrder,
  Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/base-entity.entity.js';
import { Categoria } from '../categoria/categoria.entity.js';
import { HistoricoPrecio } from '../historico_precio/historico_precio.entity.js';
import { Persona } from '../persona/persona.entity.js';
import { Compra } from '../compra/compra.entity.js';

@Entity()
export class Producto extends BaseEntity {
  @Property({ nullable: false, unique: true })
  descripcion!: string;

  @ManyToOne(() => Persona, { nullable: false })
  persona!: Rel<Persona>;

  @Property()
  stock?: number;

  @ManyToOne(() => Categoria, { nullable: false })
  categoria!: Categoria;

  @OneToMany(() => Compra, (compra) => compra.producto, {
    cascade: [Cascade.ALL],
  })
  compras = new Collection<Compra>(this);

  @OneToMany(
    () => HistoricoPrecio,
    (historico_precio) => historico_precio.producto,
    { cascade: [Cascade.ALL], orderBy: { fechaDesde: QueryOrder.ASC } }
  )
  hist_precios = new Collection<HistoricoPrecio>(this);
}
