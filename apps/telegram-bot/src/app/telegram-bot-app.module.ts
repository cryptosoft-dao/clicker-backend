import { ConfigurationModule, ConfigurationService } from '@aofg/configuration';
import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramBotBootService } from './telegram-bot-boot.service';
import { ProtocolModule } from '@aofg/protocol';
import { BackendProtocol } from '@aofg/backend-protocol';
import { CollectWorkModule } from './collect-work/collect-work.module';
import { Context } from '../interfaces/context.interface';

@Module({
    imports: [
        ConfigurationModule,
        TelegrafModule.forRootAsync({
            imports: [
                ProtocolModule.forProtocols([BackendProtocol]),
                ConfigurationModule,
            ],
            useFactory: (
                protocol: BackendProtocol,
                config: ConfigurationService
            ) => {
                return {
                    botName: config.telegramBotName,
                    token: config.telegramBotToken,
                    middlewares: [
                        async (ctx: Context, next: () => Promise<void>) => {
                            protocol.emit('cache.telegram.update', ctx.update);
                            await next();
                        },
                    ],
                };
            },
            // useClass: TelegramBotBootService,
            inject: [BackendProtocol, ConfigurationService],
        }),
        CollectWorkModule,
    ],
})
export class TelegramBotAppModule {}
