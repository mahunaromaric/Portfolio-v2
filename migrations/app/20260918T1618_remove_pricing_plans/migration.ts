#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/0857882f0933c24389c4f783397f6c03421c8ec9e0f4a7cfb4f69510cd1fd826/contract';
import startContract from '../../snapshots/0857882f0933c24389c4f783397f6c03421c8ec9e0f4a7cfb4f69510cd1fd826/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/9a07e1818811700179e4cff38e14c6b691dcdc28924e5eefe5c6409cb3b30150/contract';
import endContract from '../../snapshots/9a07e1818811700179e4cff38e14c6b691dcdc28924e5eefe5c6409cb3b30150/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [this.dropTable({ schema: 'public', table: 'pricing_plans' })];
  }
}

MigrationCLI.run(import.meta.url, M);
