import { BackendProtocol } from '@aofg/backend-protocol';
import { Injectable } from '@nestjs/common';
import { Ctx, Message, On, Update } from 'nestjs-telegraf';
import { Message as TelegramMessage } from 'telegraf/types';
import { Context } from '../../interfaces/context.interface';
import { firstValueFrom } from 'rxjs';

@Update()
export class CollectWorkService {
    constructor(private readonly backend: BackendProtocol) {}

    @On('text')
    async onText(
        @Message() msg: TelegramMessage.TextMessage,
        @Ctx() ctx: Context
    ) {
        const r = await firstValueFrom(this.backend.send('work', msg.text));
        ctx.reply('Work added: ' + r, {
            reply_parameters: { message_id: msg.message_id },
            disable_notification: true,
        });
    }

    @On('message_reaction')
    async onReaction() {}
}
