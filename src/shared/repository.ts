export interface Repository<T> {
  getAll(): Promise <T[] | undefined> 
  getOne(item: { id: string }): Promise< T | undefined>
  add(id:string,item: T): Promise <T | undefined>
  update(id:string,item: T): Promise <T | undefined>
  delete(item: { id: string }):Promise <T | undefined>
}