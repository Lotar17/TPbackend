import { Entity, Property } from '@mikro-orm/core';
import crypto from 'node:crypto';
import { BaseEntity } from '../shared/base-entity.entity.js';


@Entity()
export class Persona extends BaseEntity{

    @Property({nullable:false,unique:false})
    nombre !: string
    @Property({nullable:false,unique:false})
    apellido!: string
    
    @Property({nullable:true,unique:false})
    telefono?: string
    
    @Property({nullable:true,unique:false})
    mail!: string
}
