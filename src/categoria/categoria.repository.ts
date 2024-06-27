import { Repository } from '../shared/repository.js';
import { Categoria } from './categoria.entity.js';

const categorias: Categoria[] = [];

export class CategoriaRepository implements Repository<Categoria> {
  getAll(): Categoria[] | undefined {
    return categorias;
  }

  getOne(item: { id: string }): Categoria | undefined {
    return categorias.find((categoria) => categoria.id === item.id);
  }

  add(item: Categoria): Categoria | undefined {
    const categoriaExistente = categorias.find(
      (categoria) => categoria.id === item.id
    );
    if (categoriaExistente) {
      return undefined;
    } else {
      categorias.push(item);
      return item;
    }
  }
  delete(item: { id: string }): Categoria | undefined {
    const idCategoriaDeleted = categorias.findIndex(
      (categoria) => categoria.id === item.id
    );
    if (idCategoriaDeleted !== -1) {
      const categoriasDeleted = categorias.splice(idCategoriaDeleted, 1);
      return categoriasDeleted[0];
    }
  }
  update(item: Categoria): Categoria | undefined {
    const indexCategoriaUpdated = categorias.findIndex((categoria) => {
      categoria.id === item.id;
    });
    if (indexCategoriaUpdated !== -1) {
      categorias[indexCategoriaUpdated] = {
        ...categorias[indexCategoriaUpdated],
        ...item,
      };
    }
    return categorias[indexCategoriaUpdated];
  }
}
