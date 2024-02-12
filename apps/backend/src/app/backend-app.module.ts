import { Module } from '@nestjs/common';

import { ConfigurationModule } from '@aofg/configuration';
import { BackendAppService } from './backend-app.service';
import { CacheController } from './cache/cache.controller';
import { CacheService } from './cache/cache.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule, DatabaseService } from '@aofg/database';
import { GuildsModule } from '@aofg/guilds';
import { PeoplesModule } from '@aofg/peoples';
import { AuthModule } from '@aofg/auth';

@Module({
    imports: [
        ConfigurationModule,
        TypeOrmModule.forRootAsync({
            imports: [DatabaseModule],
            useExisting: DatabaseService,
        }),
        AuthModule,
        GuildsModule,
        PeoplesModule,
    ],
    controllers: [CacheController],
    providers: [BackendAppService, CacheService],
})
export class BackendAppModule {}
