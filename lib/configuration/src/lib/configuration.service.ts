import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationSchema } from './configuration.module';
import {
    ClientOptions,
    MicroserviceOptions,
    RmqOptions,
    Transport,
} from '@nestjs/microservices';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { JwtModuleOptions } from '@nestjs/jwt';

@Injectable()
export class ConfigurationService {
    constructor(private configService: ConfigService<ConfigurationSchema>) {}

    get admin() {
        return {
            password: this.configService.getOrThrow('ADMIN_PASSWORD', { infer: true }),
        }
    }

    get jwt(): JwtModuleOptions {
        return {
            secret: this.configService.getOrThrow('JWT_SECRET', {
                infer: true,
            }),
            signOptions: {
                expiresIn: this.configService.getOrThrow('JWT_EXPIRATION', {
                    infer: true,
                }),
            },
        };
    }

    get api() {
        return {
            port: this.configService.getOrThrow('API_PORT', { infer: true }),
        };
    }

    get cors(): CorsOptions {
        return {
            origin:
                this.configService.get('CORS_ORIGINS', { infer: true }) ?? true,
            allowedHeaders:
                this.configService.get('CORS_ALLOWED_HEADERS', {
                    infer: true,
                }) ?? '*',
            methods:
                this.configService.get('CORS_METHODS', { infer: true }) ?? '*',
        };
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
