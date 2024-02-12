import { BackendProtocol } from '@aofg/backend-protocol';
import { ConfigurationService } from '@aofg/configuration';
import { NestFactory, Reflector } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { BackendAppModule } from './app/backend-app.module';
import {
    ClassSerializerInterceptor,
    HttpException,
    HttpStatus,
    ValidationError,
    ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

(BigInt.prototype as any).toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
};

async function bootstrap() {
    const app = await NestFactory.create(BackendAppModule);
    const configService = app.get(ConfigurationService);
    app.connectMicroservice<MicroserviceOptions>(
        configService.clientConfig(BackendProtocol.channel)
    );

    app.enableCors({ ...configService.cors, credentials: true });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            exceptionFactory: (errors: ValidationError[]) =>
                new HttpException(
                    {
                        status: HttpStatus.UNPROCESSABLE_ENTITY,
                        errors: errors.reduce(
                            (accumulator, currentValue) => ({
                                ...accumulator,
                                [currentValue.property]: Object.values(
                                    currentValue.constraints ?? {}
                                ).join(', '),
                            }),
                            {}
                        ),
                    },
                    HttpStatus.UNPROCESSABLE_ENTITY
                ),
        })
    );
    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(app.get(Reflector))
    );

    const swaggerConfig = new DocumentBuilder()
        .setTitle('AOFG API')
        .addBearerAuth()
        .addBearerAuth(undefined, 'refresh');

    const document = SwaggerModule.createDocument(app, swaggerConfig.build());
    SwaggerModule.setup('swagger', app, document);

    await app.startAllMicroservices();
    app.listen(configService.api.port);
    await app.init();
}

bootstrap();
