#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/501dad6c28f7699f9c3e531103674c2e15bb7bab7498fc897c46dacd10f42ea5/contract';
import startContract from '../../snapshots/501dad6c28f7699f9c3e531103674c2e15bb7bab7498fc897c46dacd10f42ea5/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/c553864d0b9ef0ad8934854d2c5d9a3265ec2e7a56b4bf887c39548457b51609/contract';
import endContract from '../../snapshots/c553864d0b9ef0ad8934854d2c5d9a3265ec2e7a56b4bf887c39548457b51609/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'messages',
        column: col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
