import { ConfigurationService } from '@aofg/configuration';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { DiscordBotAppModule } from './app/discord-bot-app.module';

async function bootstrap() {
    const app = await NestFactory.create(DiscordBotAppModule);
    const configService = app.get(ConfigurationService);
    app.connectMicroservice<MicroserviceOptions>(
        configService.clientConfig('DISCORD_BOT')
    );
    await app.startAllMicroservices();
    await app.init();
}

bootstrap();
