import { Repository } from '../shared/repository.js';
import { Persona } from './persona.entity.js';

const personas: Persona[] = [];

export class PersonaRepository implements Repository<Persona> {
  getAll(): Persona[] | undefined {
    return personas;
  }

  getOne(item: { id: string }): Persona | undefined {
    return personas.find((persona) => persona.id === item.id);
  }

  add(item: Persona): Persona | undefined {
    personas.push(item);
    return item;
  }
  delete(item: { id: string }): Persona | undefined {
    const dniPersonaDeleted = personas.findIndex(
      (persona) => persona.id === item.id
    );
    if (dniPersonaDeleted !== -1) {
      const personasDeleted = personas.splice(dniPersonaDeleted, 1);
      return personasDeleted[0];
    }
  }
}
