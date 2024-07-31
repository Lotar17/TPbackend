import { Entity, ManyToOne, Property, Rel } from '@mikro-orm/core';
import { BaseEntity } from '../shared/base-entity.entity.js';
import { Categoria } from '../categoria/categoria.entity.js';

@Entity()
export class Producto extends BaseEntity {
  @Property({ nullable: false, unique: true })
  descripcion!: string;

  @Property({ nullable: false })
  precio!: number;

  @Property()
  stock?: number;

  @ManyToOne(() => Categoria, { nullable: false })
  categoria!: Categoria;
}
