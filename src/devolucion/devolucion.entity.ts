import { Entity, ManyToOne, OneToOne, Property,OneToMany,Cascade,Collection, Rel } from '@mikro-orm/core';
import { BaseEntity } from '../shared/base-entity.entity.js';
import { Compra } from '../compra/compra.entity.js';
import { Persona } from '../persona/persona.entity.js';
import { Item } from '../item/item.entity.js';

@Entity()
export class Devolucion extends BaseEntity {


    @OneToOne(() => Item, { nullable: false })
    item!: Rel<Item>;
  

  @ManyToOne(() => Persona, { nullable: false })
  comprador!: Rel<Persona>;

  @ManyToOne(() => Persona, { nullable: false })
  vendedor!: Rel<Persona>;

  @Property({ nullable: true })
  motivo!: string;

  @Property({ nullable: true })
  estado!: string;


  @Property({ nullable: true })
  codigoConfirmacion!: number;

  @Property({ nullable: true })
  fechaSolicitud!: string;

  @Property({ nullable: true })
  fechaConfirmacion!: string|null;

  @Property({ nullable: true })
  cantidad_devuelta!: number;

  @Property({ nullable: true })
  fechaEnvioCliente?: string;
  
  @Property({ nullable: true })
  fechaCierre?: string; // esto se genera cuando el vendededor afirma que el producto llego a destino
  
  @Property({ nullable: true })
  mensajeCierre?: string;
}

