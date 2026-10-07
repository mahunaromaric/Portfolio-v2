#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/926566f7fc0ab680d2d46f33451e8a8863082f57620da02e951cb6865970891d/contract';
import endContract from '../../snapshots/926566f7fc0ab680d2d46f33451e8a8863082f57620da02e951cb6865970891d/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'admin_sessions',
        columns: [
          col('adminUserId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('expiresAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('ipHash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('tokenHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userAgent', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'admin_users',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('lastLoginAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('passwordHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'case_studies',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('projectId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'case_study_blocks',
        columns: [
          col('caseStudyId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('content', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('displayOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'case_study_blocks_type_check_5233046c',
            "\"type\" IN ('TEXT', 'IMAGE', 'IMAGE_GALLERY', 'QUOTE', 'FEATURES', 'TECHNICAL')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'educations',
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
          col('endDate', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('institution', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('location', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('program', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('startDate', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('PUBLISHED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'educations_status_check_4aaa56f2',
            "\"status\" IN ('DRAFT', 'PUBLISHED', 'HIDDEN')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'experiences',
        columns: [
          col('company', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
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
          col('endDate', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('location', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('startDate', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('PUBLISHED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'experiences_status_check_4aaa56f2',
            "\"status\" IN ('DRAFT', 'PUBLISHED', 'HIDDEN')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'media',
        columns: [
          col('alt', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('bucketKey', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('height', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('mimeType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('size', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('url', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('width', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'media_type_check_7891ea4f',
            "\"type\" IN ('IMAGE', 'VIDEO', 'DOCUMENT')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'messages',
        columns: [
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('ipHash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('NEW'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('subject', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userAgent', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'messages_status_check_4518e741',
            "\"status\" IN ('NEW', 'READ', 'REPLIED', 'ARCHIVED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'profiles',
        columns: [
          col('availabilityLabel', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('avatarUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('bio', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('contactEmail', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('cvUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('headline', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('location', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'project_categories',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'project_media',
        columns: [
          col('displayOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('isCover', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('mediaId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('projectId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['projectId', 'mediaId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'project_technologies',
        columns: [
          col('displayOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('projectId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('technologyId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['projectId', 'technologyId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'projects',
        columns: [
          col('categoryId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('displayOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('featured', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('githubUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('liveUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('shortDescription', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
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
          col('year', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'projects_status_check_4aaa56f2',
            "\"status\" IN ('DRAFT', 'PUBLISHED', 'HIDDEN')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'social_links',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('displayOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('label', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('platform', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('profileId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('url', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'technologies',
        columns: [
          col('categoryId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('icon', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('proficiency', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('websiteUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'technology_categories',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('displayOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'testimonials',
        columns: [
          col('author', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('company', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('displayOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('rating', 'int4', {
            notNull: true,
            default: lit(5),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('role', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PUBLISHED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'testimonials_status_check_4aaa56f2',
            "\"status\" IN ('DRAFT', 'PUBLISHED', 'HIDDEN')",
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'admin_sessions',
        constraint: 'admin_sessions_tokenHash_key',
        columns: ['tokenHash'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'admin_users',
        constraint: 'admin_users_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'case_studies',
        constraint: 'case_studies_projectId_key',
        columns: ['projectId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'media',
        constraint: 'media_bucketKey_key',
        columns: ['bucketKey'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'project_categories',
        constraint: 'project_categories_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'project_categories',
        constraint: 'project_categories_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'projects',
        constraint: 'projects_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'technologies',
        constraint: 'technologies_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'technologies',
        constraint: 'technologies_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'technology_categories',
        constraint: 'technology_categories_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'technology_categories',
        constraint: 'technology_categories_slug_key',
        columns: ['slug'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'admin_sessions',
        index: 'admin_sessions_adminUserId_idx_0ce093a3',
        columns: ['adminUserId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'admin_sessions',
        index: 'admin_sessions_expiresAt_idx_6b6b8c10',
        columns: ['expiresAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'case_study_blocks',
        index: 'case_study_blocks_caseStudyId_displayOrder_idx_d2732653',
        columns: ['caseStudyId', 'displayOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'case_study_blocks',
        index: 'case_study_blocks_caseStudyId_idx_2c413cef',
        columns: ['caseStudyId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'educations',
        index: 'educations_displayOrder_idx_607f1474',
        columns: ['displayOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'educations',
        index: 'educations_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'experiences',
        index: 'experiences_displayOrder_idx_607f1474',
        columns: ['displayOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'experiences',
        index: 'experiences_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'media',
        index: 'media_type_idx_b6b604ea',
        columns: ['type'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'messages',
        index: 'messages_createdAt_idx_9575dbd7',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'messages',
        index: 'messages_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'project_categories',
        index: 'project_categories_slug_idx_73b7f5ce',
        columns: ['slug'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'project_media',
        index: 'project_media_mediaId_idx_6b06655c',
        columns: ['mediaId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'project_media',
        index: 'project_media_projectId_displayOrder_idx_2c65ba86',
        columns: ['projectId', 'displayOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'project_media',
        index: 'project_media_projectId_idx_a96e4d92',
        columns: ['projectId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'project_technologies',
        index: 'project_technologies_projectId_displayOrder_idx_2c65ba86',
        columns: ['projectId', 'displayOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'project_technologies',
        index: 'project_technologies_projectId_idx_a96e4d92',
        columns: ['projectId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'project_technologies',
        index: 'project_technologies_technologyId_idx_1e2af707',
        columns: ['technologyId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'projects',
        index: 'projects_categoryId_idx_15c304f2',
        columns: ['categoryId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'projects',
        index: 'projects_displayOrder_idx_607f1474',
        columns: ['displayOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'projects',
        index: 'projects_featured_idx_edc6fe9b',
        columns: ['featured'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'projects',
        index: 'projects_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'social_links',
        index: 'social_links_profileId_displayOrder_idx_25a70810',
        columns: ['profileId', 'displayOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'social_links',
        index: 'social_links_profileId_idx_d9cdfcaf',
        columns: ['profileId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'technologies',
        index: 'technologies_categoryId_idx_15c304f2',
        columns: ['categoryId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'technology_categories',
        index: 'technology_categories_displayOrder_idx_607f1474',
        columns: ['displayOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'testimonials',
        index: 'testimonials_displayOrder_idx_607f1474',
        columns: ['displayOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'testimonials',
        index: 'testimonials_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'admin_sessions',
        foreignKey: {
          name: 'admin_sessions_adminUserId_fkey',
          columns: ['adminUserId'],
          references: { schema: 'public', table: 'admin_users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'case_studies',
        foreignKey: {
          name: 'case_studies_projectId_fkey',
          columns: ['projectId'],
          references: { schema: 'public', table: 'projects', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'case_study_blocks',
        foreignKey: {
          name: 'case_study_blocks_caseStudyId_fkey',
          columns: ['caseStudyId'],
          references: { schema: 'public', table: 'case_studies', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'project_media',
        foreignKey: {
          name: 'project_media_projectId_fkey',
          columns: ['projectId'],
          references: { schema: 'public', table: 'projects', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'project_media',
        foreignKey: {
          name: 'project_media_mediaId_fkey',
          columns: ['mediaId'],
          references: { schema: 'public', table: 'media', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'project_technologies',
        foreignKey: {
          name: 'project_technologies_projectId_fkey',
          columns: ['projectId'],
          references: { schema: 'public', table: 'projects', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'project_technologies',
        foreignKey: {
          name: 'project_technologies_technologyId_fkey',
          columns: ['technologyId'],
          references: { schema: 'public', table: 'technologies', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'projects',
        foreignKey: {
          name: 'projects_categoryId_fkey',
          columns: ['categoryId'],
          references: { schema: 'public', table: 'project_categories', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'social_links',
        foreignKey: {
          name: 'social_links_profileId_fkey',
          columns: ['profileId'],
          references: { schema: 'public', table: 'profiles', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'technologies',
        foreignKey: {
          name: 'technologies_categoryId_fkey',
          columns: ['categoryId'],
          references: { schema: 'public', table: 'technology_categories', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
