
import { vi } from 'vitest'

export const em = {
  findOne: vi.fn(async (entity, where) => {
    console.log('🔍 MOCK findOne llamado con:', where);
    // el hash lo podés simplificar
    return {
      id: '123',
      mail: 'usuario@example.com',
      nombre: 'Juan',
      apellido: 'Pérez',
      rol: 'cliente',
      password: '$2b$10$FAKEHASHedvaluehere', // falso pero suficiente si bcrypt.compare está mockeado
    };
  }),
};
