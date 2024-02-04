import { BackendProtocol } from '@aofg/backend-protocol';
import { ConfigurationService } from '@aofg/configuration';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { BackendAppModule } from './app/backend-app.module';

async function bootstrap() {
    const app = await NestFactory.create(BackendAppModule);
    const configService = app.get(ConfigurationService);
    app.connectMicroservice<MicroserviceOptions>(
        configService.clientConfig(BackendProtocol.channel)
    );
    await app.startAllMicroservices();
    await app.init();
}

bootstrap();
