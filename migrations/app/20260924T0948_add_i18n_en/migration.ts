#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/53d741f551bb5d91911eb96e6b01b635bd86dc60d8fa434f693a0fc385ce7c24/contract';
import endContract from '../../snapshots/53d741f551bb5d91911eb96e6b01b635bd86dc60d8fa434f693a0fc385ce7c24/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/c553864d0b9ef0ad8934854d2c5d9a3265ec2e7a56b4bf887c39548457b51609/contract';
import startContract from '../../snapshots/c553864d0b9ef0ad8934854d2c5d9a3265ec2e7a56b4bf887c39548457b51609/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'collaboration_phases',
        column: col('descriptionEn', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'collaboration_phases',
        column: col('titleEn', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'services',
        column: col('descriptionEn', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'services',
        column: col('titleEn', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
