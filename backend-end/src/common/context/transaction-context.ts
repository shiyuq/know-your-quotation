import { AsyncLocalStorage } from 'async_hooks';
import { EntityManager } from 'typeorm';

export const txManagerALS = new AsyncLocalStorage<EntityManager>();

export function getTxManager(): EntityManager | undefined {
  return txManagerALS.getStore();
}
