#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/53d741f551bb5d91911eb96e6b01b635bd86dc60d8fa434f693a0fc385ce7c24/contract';
import startContract from '../../snapshots/53d741f551bb5d91911eb96e6b01b635bd86dc60d8fa434f693a0fc385ce7c24/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/a6afde84f7b0321dde82b6ccf7cf84ff9296f5b13593bda0df451f7d4967fb6a/contract';
import endContract from '../../snapshots/a6afde84f7b0321dde82b6ccf7cf84ff9296f5b13593bda0df451f7d4967fb6a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'admin_users',
        column: col('totpEnabled', 'bool', {
          notNull: true,
          default: lit(false),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'admin_users',
        column: col('totpSecret', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'educations',
        column: col('descriptionEn', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'educations',
        column: col('institutionEn', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'educations',
        column: col('programEn', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'experiences',
        column: col('companyEn', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'experiences',
        column: col('descriptionEn', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'experiences',
        column: col('roleEn', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'profiles',
        column: col('availabilityLabelEn', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'profiles',
        column: col('bioEn', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'profiles',
        column: col('headlineEn', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'project_categories',
        column: col('descriptionEn', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'project_categories',
        column: col('nameEn', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'projects',
        column: col('roleEn', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'projects',
        column: col('shortDescriptionEn', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'projects',
        column: col('titleEn', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
