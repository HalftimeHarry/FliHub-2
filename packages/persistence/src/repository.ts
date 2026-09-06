export interface EntityRepository<Entity, Id> {
  findById(id: Id): Promise<Entity | undefined>;
  save(entity: Entity): Promise<void>;
  list(): Promise<readonly Entity[]>;
}
