import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { Scenes } from 'telegraf'
import { CacheService } from './cache.service';

@Controller()
export class CacheController {
    constructor(
        private readonly cacheService: CacheService
    ){}

    @EventPattern('cache.telegram.update')
    onTelegramUpdateCacheRequest(@Payload() data: Scenes.SceneContext) {
        this.cacheService.store('telegram.update', data);
    }

    @EventPattern('cache.discord.update')
    onDiscordUpdateCacheRequest(@Payload() data: unknown) {
        this.cacheService.store('discord.update', data);
    }
    
    @MessagePattern({ cmd: 'work' })
    addWork(@Payload() data: string): number {
        console.log('enque work', data)
        return data.length;
    }
}
