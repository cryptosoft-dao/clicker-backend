import { ConfigurationService } from '@aofg/configuration';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { TelegramBotAppModule } from './app/telegram-bot-app.module';

async function bootstrap() {
    const app = await NestFactory.create(TelegramBotAppModule);
    const configService = app.get(ConfigurationService);
    app.connectMicroservice<MicroserviceOptions>(
        configService.clientConfig('TELEGRAM_BOT')
    );
    await app.startAllMicroservices();
    await app.init();
}

bootstrap();
