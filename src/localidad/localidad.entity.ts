import { Entity,Property,Rel,OneToMany } from "@mikro-orm/core";
import { BaseEntity } from "../shared/base-entity.entity.js";

@Entity()
export class Localidad extends BaseEntity{

    @Property({ nullable: true })
    nombre!: number;

    @Property({ nullable: true })
    codigoPostal!: number;


}