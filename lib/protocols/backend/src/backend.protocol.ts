import { AsProtocol, Protocol, ProtocolSchema } from '@aofg/protocol';
import { Scenes } from 'telegraf';
import { IsNumber, IsString } from 'class-validator';

export class WorkRequestDto {
    @IsString()
    guild!: string;

    @IsString()
    man!: string;

    @IsNumber()
    value!: number;
}

export class WorkResponseDto {
    @IsNumber()
    manTotalWork!: number;

    @IsNumber()
    guildTotalWork!: number;
}

export type BackendEvents = {
    'cache.telegram.update': Scenes.SceneContext['update'];
    'cache.discord.update': unknown;
};

export type BackendMessages = {
    work: { request: string; response: number };
};

export type BackendProtocolSchema = ProtocolSchema<
    'BACKEND',
    BackendMessages,
    BackendEvents
>;

@AsProtocol<BackendProtocolSchema>()
export class BackendProtocol extends Protocol<BackendProtocolSchema> {
    static readonly channel = 'BACKEND';
}
