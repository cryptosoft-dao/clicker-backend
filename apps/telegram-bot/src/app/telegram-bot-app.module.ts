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
                    launchOptions: {
                        allowedUpdates: [
                            'message',
                            'edited_message',
                            'channel_post',
                            'edited_channel_post',
                            'message_reaction',
                            'message_reaction_count',
                            'inline_query',
                            'chosen_inline_result',
                            'callback_query',
                            'shipping_query',
                            'pre_checkout_query',
                            'poll',
                            'poll_answer',
                            'my_chat_member',
                            'chat_member',
                            'chat_join_request',
                            'chat_boost',
                            'removed_chat_boost',
                        ]
                    },
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
