#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/a6afde84f7b0321dde82b6ccf7cf84ff9296f5b13593bda0df451f7d4967fb6a/contract';
import startContract from '../../snapshots/a6afde84f7b0321dde82b6ccf7cf84ff9296f5b13593bda0df451f7d4967fb6a/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/d70ff111389115233c687ba14241047f5728168b28ddbe485554eb6a03bdeb71/contract';
import endContract from '../../snapshots/d70ff111389115233c687ba14241047f5728168b28ddbe485554eb6a03bdeb71/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'site_texts',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('en', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('fr', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('key', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'site_texts',
        constraint: 'site_texts_key_key',
        columns: ['key'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
