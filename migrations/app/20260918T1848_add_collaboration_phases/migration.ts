#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/501dad6c28f7699f9c3e531103674c2e15bb7bab7498fc897c46dacd10f42ea5/contract';
import endContract from '../../snapshots/501dad6c28f7699f9c3e531103674c2e15bb7bab7498fc897c46dacd10f42ea5/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/fbb404628134055f60fc9f45498bca190a87558f043cb78800666c26d0b05b36/contract';
import startContract from '../../snapshots/fbb404628134055f60fc9f45498bca190a87558f043cb78800666c26d0b05b36/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'collaboration_phases',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('displayOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('number', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'collaboration_phases',
        index: 'collaboration_phases_displayOrder_idx_607f1474',
        columns: ['displayOrder'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
