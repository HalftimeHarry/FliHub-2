import { Identifier } from '@flihub/core';
import type { EntityRepository } from './repository.js';

export interface IdentifiedEntity {
  readonly id: Identifier;
}

export class InMemoryRepository<
  Entity extends IdentifiedEntity
> implements EntityRepository<Entity, Identifier> {
  private readonly records = new Map<string, Entity>();

  public constructor(seedEntities: readonly Entity[] = []) {
    for (const entity of seedEntities) {
      this.records.set(entity.id.value, entity);
    }
  }

  public findById(id: Identifier): Promise<Entity | undefined> {
    return Promise.resolve(this.records.get(id.value));
  }

  public save(entity: Entity): Promise<void> {
    this.records.set(entity.id.value, entity);
    return Promise.resolve();
  }

  public list(): Promise<readonly Entity[]> {
    return Promise.resolve([...this.records.values()]);
  }
}
