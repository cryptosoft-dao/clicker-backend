import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationSchema } from './configuration.module';
import {
    ClientOptions,
    MicroserviceOptions,
    RmqOptions,
    Transport,
} from '@nestjs/microservices';

@Injectable()
export class ConfigurationService {
    constructor(private configService: ConfigService<ConfigurationSchema>) {
        console.log(
            this.configService.getOrThrow('TELEGRAM_BOT_TOKEN', { infer: true })
        );
    }

    get db() {
        return {
            type: 'postgres',
            host: this.configService.getOrThrow('DB_HOST', { infer: true }),
            port: this.configService.getOrThrow('DB_PORT', { infer: true }),
            username: this.configService.getOrThrow('DB_USERNAME', {
                infer: true,
            }),
            password: this.configService.getOrThrow('DB_PASSWORD', {
                infer: true,
            }),
            database: this.configService.getOrThrow('DB_DATABASE', {
                infer: true,
            }),
            ssl: this.configService.getOrThrow('DB_SSL', { infer: true }),
        } as const;
    }

    get telegramBotToken(): string {
        return this.configService.getOrThrow('TELEGRAM_BOT_TOKEN', {
            infer: true,
        });
    }

    get telegramBotName(): string {
        return this.configService.getOrThrow('TELEGRAM_BOT_NAME', {
            infer: true,
        });
    }

    get discordBotToken(): string {
        return this.configService.getOrThrow('DISCORD_BOT_TOKEN', {
            infer: true,
        });
    }

    clientConfig(channel: string, consumerTag?: string): ClientOptions {
        const url = this.configService.getOrThrow('RABBITMQ_URL', {
            infer: true,
        });
        const queue =
            this.configService.getOrThrow('RABBITMQ_QUEUE', {
                infer: true,
            }) + `.${channel}`;
        return {
            transport: Transport.RMQ,
            options: {
                urls: [url],
                queue,
                consumerTag,
                queueOptions: {
                    durable: false,
                },
            },
        };
    }
}
