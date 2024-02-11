import { Controller, Get, Injectable, Module, Param } from '@nestjs/common';
export * from './guild.entity';

@Injectable()
export class GuildsService {
    constructor() {}

    public getGuild(id: string) {
        return {
            id,
            name: 'Guild',
            members: [
                {
                    id: 'member-id',
                    name: 'Member',
                    work: 100n,
                },
            ],
        };
    }
}

@Controller('guilds')
export class GuildsController {
    constructor(private readonly guildService: GuildsService) {
        
    }

    @Get('/:id')
    public getGuild(@Param('id') id: string) {
        return this.guildService.getGuild(id);
    }
}

@Module({
    controllers: [],
    providers: [],
    exports: [],
})
export class GuildsModule {}
