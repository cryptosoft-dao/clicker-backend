import { Module } from '@nestjs/common';

import { ConfigurationModule } from '@aofg/configuration';
import { BackendAppService } from './backend-app.service';
import { CacheController } from './cache/cache.controller';
import { CacheService } from './cache/cache.service';
import { WorkController } from './work/work.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule, DatabaseService } from '@aofg/database';
import { ApiModule } from './api/api.module';
import { WorkModule } from '@aofg/work';
import { GuildsModule } from '@aofg/guilds';
import { PeoplesModule } from '@aofg/peoples';

@Module({
    imports: [
        ConfigurationModule,
        TypeOrmModule.forRootAsync({
            imports: [DatabaseModule],
            useExisting: DatabaseService,
        }),
        WorkModule,
        GuildsModule,
        PeoplesModule,
        ApiModule,
    ],
    controllers: [CacheController, WorkController],
    providers: [BackendAppService, CacheService],
})
export class BackendAppModule {}
