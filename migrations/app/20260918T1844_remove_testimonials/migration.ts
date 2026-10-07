#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/9a07e1818811700179e4cff38e14c6b691dcdc28924e5eefe5c6409cb3b30150/contract';
import startContract from '../../snapshots/9a07e1818811700179e4cff38e14c6b691dcdc28924e5eefe5c6409cb3b30150/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/fbb404628134055f60fc9f45498bca190a87558f043cb78800666c26d0b05b36/contract';
import endContract from '../../snapshots/fbb404628134055f60fc9f45498bca190a87558f043cb78800666c26d0b05b36/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [this.dropTable({ schema: 'public', table: 'testimonials' })];
  }
}

MigrationCLI.run(import.meta.url, M);
