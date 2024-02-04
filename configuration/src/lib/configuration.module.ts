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
});

export type ConfigurationSchema = Static<typeof ConfigurationSchema>;

const validate = (config: Record<string, unknown>): ConfigurationSchema => {
  if (Value.Check(ConfigurationSchema, config)) {
    return config;
  } else {
    console.error(
      Array.from(Value.Errors(ConfigurationSchema, config))
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
      validate,
    }),
  ],
  exports: [ConfigurationService],
})
export class ConfigurationModule {}
