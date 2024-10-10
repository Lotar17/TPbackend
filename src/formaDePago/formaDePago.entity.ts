import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '../shared/base-entity.entity.js';

@Entity()
export class FormaDePago extends BaseEntity {
  @Property({ nullable: false, unique: true })
  descripcion!: string;
}
