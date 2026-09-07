export interface EntityRepository<Entity, Id> {
  findById(id: Id): Promise<Entity | undefined>;
  save(entity: Entity): Promise<void>;
  deleteById(id: Id): Promise<void>;
  list(): Promise<readonly Entity[]>;
}
