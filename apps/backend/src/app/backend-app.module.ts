import { Module } from '@nestjs/common';

import { ConfigurationModule } from '@aofg/configuration';
import { BackendAppService } from './backend-app.service';
import { CacheController } from './cache/cache.controller';
import { CacheService } from './cache/cache.service';
import { WorkController } from './work/work.controller';

@Module({
    imports: [ConfigurationModule],
    controllers: [CacheController, WorkController],
    providers: [BackendAppService, CacheService],
})
export class BackendAppModule {}
