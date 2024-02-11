import 'pg'; // Hack to inject dependency to build

import { ConfigurationModule, ConfigurationService } from '@aofg/configuration';
import { Injectable, Module } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import * as migrations from './migrations';
import * as entities from './entities';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  constructor(private config: ConfigurationService) {}

  createTypeOrmOptions() : TypeOrmModuleOptions {
    const db = this.config.db;
    return {
      ...db,
      ssl: db.ssl ? { rejectUnauthorized: false } : undefined,
      entities,
      migrations,
      synchronize: false,
      migrationsTableName: 'migrations',
      migrationsRun: true,
    };
  }
}


@Module({
    imports: [ConfigurationModule],
    controllers: [],
    providers: [DatabaseService],
    exports: [DatabaseService],
})
export class DatabaseModule {}
