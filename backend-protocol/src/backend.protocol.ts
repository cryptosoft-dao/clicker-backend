import { AsProtocol, Protocol, ProtocolSchema } from '@aofg/protocol'
import { Scenes } from 'telegraf'

export type BackendEvents = {
    'cache.telegram.update': Scenes.SceneContext['update']
    'cache.discord.update': unknown
}

export type BackendMessages = {
    'work': { request: string, response: number }
}

export type BackendProtocolSchema = ProtocolSchema<'BACKEND', BackendMessages, BackendEvents>


@AsProtocol<BackendProtocolSchema>()
export class BackendProtocol extends Protocol<BackendProtocolSchema> {
    static readonly channel = 'BACKEND'
}