#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/926566f7fc0ab680d2d46f33451e8a8863082f57620da02e951cb6865970891d/contract';
import startContract from '../../snapshots/926566f7fc0ab680d2d46f33451e8a8863082f57620da02e951cb6865970891d/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/9978a006e87922a39dab6e5eb0832e94b26b94582726e1d604efc9db8ad3066e/contract';
import endContract from '../../snapshots/9978a006e87922a39dab6e5eb0832e94b26b94582726e1d604efc9db8ad3066e/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'login_attempts',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('ipHash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'login_attempts',
        index: 'login_attempts_email_createdAt_idx_6e3c0d8a',
        columns: ['email', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'login_attempts',
        index: 'login_attempts_ipHash_createdAt_idx_8d6020ac',
        columns: ['ipHash', 'createdAt'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
