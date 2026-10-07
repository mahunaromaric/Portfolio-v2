#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/0857882f0933c24389c4f783397f6c03421c8ec9e0f4a7cfb4f69510cd1fd826/contract';
import endContract from '../../snapshots/0857882f0933c24389c4f783397f6c03421c8ec9e0f4a7cfb4f69510cd1fd826/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/9978a006e87922a39dab6e5eb0832e94b26b94582726e1d604efc9db8ad3066e/contract';
import startContract from '../../snapshots/9978a006e87922a39dab6e5eb0832e94b26b94582726e1d604efc9db8ad3066e/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'pricing_plans',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('ctaHref', 'text', { default: lit('/#contact'), codecRef: { codecId: 'pg/text@1' } }),
          col('ctaLabel', 'text', {
            default: lit('Travaillons ensemble'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('displayOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('features', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('highlighted', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('period', 'text', { default: lit('/mois'), codecRef: { codecId: 'pg/text@1' } }),
          col('priceLabel', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PUBLISHED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('subtitle', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'pricing_plans_status_check_4aaa56f2',
            "\"status\" IN ('DRAFT', 'PUBLISHED', 'HIDDEN')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'services',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('displayOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PUBLISHED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'services_status_check_4aaa56f2',
            "\"status\" IN ('DRAFT', 'PUBLISHED', 'HIDDEN')",
          ),
        ],
      }),
      this.createIndex({
        schema: 'public',
        table: 'pricing_plans',
        index: 'pricing_plans_displayOrder_idx_607f1474',
        columns: ['displayOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'pricing_plans',
        index: 'pricing_plans_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'services',
        index: 'services_displayOrder_idx_607f1474',
        columns: ['displayOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'services',
        index: 'services_status_idx_e98638ab',
        columns: ['status'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
