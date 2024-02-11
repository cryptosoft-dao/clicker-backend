import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Static, Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { ConfigurationService } from './configuration.service';
export * from './configuration.service';

const ConfigurationSchema = Type.Object({
    TELEGRAM_BOT_TOKEN: Type.String(),
    TELEGRAM_BOT_NAME: Type.String(),
    DISCORD_BOT_TOKEN: Type.String(),
    RABBITMQ_URL: Type.String(),
    RABBITMQ_QUEUE: Type.String(),

    DB_HOST: Type.String(),
    DB_PORT: Type.Number(),
    DB_USERNAME: Type.String(),
    DB_PASSWORD: Type.String(),
    DB_DATABASE: Type.String(),
    DB_SSL: Type.Boolean(),
});

export type ConfigurationSchema = Static<typeof ConfigurationSchema>;

export const ConfigLoader = (config: Record<string, unknown>): ConfigurationSchema => {
    const converted = Value.Convert(ConfigurationSchema, config)
    if (Value.Check(ConfigurationSchema, converted)) {
        return converted;
    } else {
        console.error(
            Array.from(Value.Errors(ConfigurationSchema, converted))
                .map((e) => `${e.path}: ${e.message}`)
                .join('\n')
        );
        throw new Error('Invalid configuration');
    }
};

@Module({
    controllers: [],
    providers: [ConfigurationService],
    imports: [
        ConfigModule.forRoot({
            validate: ConfigLoader,
        }),
    ],
    exports: [ConfigurationService],
})
export class ConfigurationModule {}
