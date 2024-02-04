import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationSchema } from './configuration.module';
import { ClientOptions, MicroserviceOptions, RmqOptions, Transport } from '@nestjs/microservices';


@Injectable()
export class ConfigurationService {
  constructor(private configService: ConfigService<ConfigurationSchema>) {
    console.log(this.configService.getOrThrow('TELEGRAM_BOT_TOKEN', { infer: true }))
  }

  get telegramBotToken(): string {
    return this.configService.getOrThrow('TELEGRAM_BOT_TOKEN', { infer: true });
  }

  get telegramBotName(): string {
    return this.configService.getOrThrow('TELEGRAM_BOT_NAME', { infer: true });
  }

  get discordBotToken(): string {
    return this.configService.getOrThrow('DISCORD_BOT_TOKEN', { infer: true });
  }

  clientConfig(channel: string, consumerTag?: string): ClientOptions {
    const url = this.configService.getOrThrow('RABBITMQ_URL', { infer: true });
    const queue = this.configService.getOrThrow('RABBITMQ_QUEUE', {
      infer: true,
    }) + `.${channel}`;
    return {
      transport: Transport.RMQ,
      options: {
        urls: [url],
        queue,
        consumerTag,
        queueOptions: {
          durable: false
        }
      }
    };
  }
}
