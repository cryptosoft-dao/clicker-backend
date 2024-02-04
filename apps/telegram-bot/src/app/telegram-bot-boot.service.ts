import { BackendProtocol } from '@aofg/backend-protocol';
import { ConfigurationService } from '@aofg/configuration';
import { Injectable } from '@nestjs/common';
import { TelegrafModuleOptions, TelegrafOptionsFactory } from 'nestjs-telegraf';
import { Context } from '../interfaces/context.interface';

@Injectable()
export class TelegramBotBootService implements TelegrafOptionsFactory {
    constructor(
        private readonly config: ConfigurationService,
        private readonly protocol: BackendProtocol
    ) {
        console.log('TelegramBotBootService');
    }

    createTelegrafOptions():
        | TelegrafModuleOptions
        | Promise<TelegrafModuleOptions> {
        return {
            botName: this.config.telegramBotName,
            token: this.config.telegramBotToken,
            //   middlewares: [this.processor.bind(this)],
            // include: [CollectWorkModule],
        };
    }

    async processor(ctx: Context, next: () => Promise<void>) {
        this.protocol.emit('cache.telegram.update', ctx.update);
        await next();
    }
}
