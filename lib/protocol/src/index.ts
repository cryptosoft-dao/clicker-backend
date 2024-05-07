import { ConfigurationModule, ConfigurationService } from '@aofg/configuration';
import {
    DynamicModule,
    Module,
    OnApplicationBootstrap
} from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';

export type ProtocolMessage<TRequest, TResponse> = {
    request: TRequest;
    response: TResponse;
};

export type ProtocolMessages = Record<
    string,
    ProtocolMessage<unknown, unknown>
>;
export type ProtocolEvents = Record<string, unknown>;

export type ProtocolSchema<
    TChannel extends string = string,
    TMessages extends ProtocolMessages = any,
    TEvents extends ProtocolEvents = any
> = {
    channel: TChannel;
    messages: TMessages;
    events: TEvents;
};

export type ProtocolDefinition<T extends ProtocolSchema> = Pick<T, 'channel'>;

export interface ProtocolConstructor<T extends ProtocolSchema> {
    channel: T['channel'];
    new (...args: any[]): Protocol<T>;
}

export function AsProtocol<T extends ProtocolSchema>() {
    return <U extends ProtocolConstructor<T>>(constructor: U) => {
        constructor;
    };
}

export abstract class Protocol<T extends ProtocolSchema>
    implements OnApplicationBootstrap
{
    private readonly client: ClientProxy;

    constructor(
        private readonly config: ConfigurationService,
        private readonly channel: ProtocolDefinition<T>['channel']
    ) {
        this.client = ClientProxyFactory.create(
            this.config.clientConfig(this.channel)
        );
    }

    onApplicationBootstrap() {
        return this.client.connect();
    }

    emit<TEvent extends keyof T['events']>(
        event: TEvent,
        data: T['events'][TEvent]
    ) {
        this.client.emit(event, data);
    }

    send<TMessage extends keyof T['messages']>(
        message: TMessage,
        data: T['messages'][TMessage]['request']
    ) {
        return this.client.send<T['messages'][TMessage]['response']>(
            { cmd: message },
            data
        );
    }
}

@Module({})
export class ProtocolModule {
    static forProtocols<T extends ProtocolSchema[]>(
        ctors: ProtocolConstructor<T[number]>[]
    ): DynamicModule {
        return {
            module: ProtocolModule,
            imports: [ConfigurationModule],
            providers: ctors.map((ctor) => ({
                provide: ctor,
                useFactory: (config: ConfigurationService) => {
                    console.log('protocol ctor', ctor);
                    return new ctor(config, ctor.channel);
                },
                inject: [ConfigurationService],
            })),
            exports: ctors.map((ctor) => ctor),
        };
    }
}
