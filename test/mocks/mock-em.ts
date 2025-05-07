import bcrypt from 'bcrypt'
import { vi } from 'vitest'

export const em = {
  findOne: vi.fn(async (entity, where) => {
    if (where.mail === 'usuario@example.com') {
      return {
        id: '123',
        mail: 'usuario@example.com',
        nombre: 'Juan',
        apellido: 'Pérez',
        rol: 'cliente',
        password: await bcrypt.hash('123456', 10),
      }
    }
    return null
  }),
}
