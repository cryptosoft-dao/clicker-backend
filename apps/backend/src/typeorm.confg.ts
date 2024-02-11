import {
    ConfigLoader,
    ConfigurationModule,
    ConfigurationService,
} from '@aofg/configuration';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';

async function buildDataSource() {
    const context = await NestFactory.createApplicationContext({
        imports: [
            ConfigModule.forRoot({
                validate: ConfigLoader,
            }),
            ConfigurationModule,
        ],
    });

    const cfg = context.get(ConfigurationService);

    return new DataSource(cfg.db);
}

export default buildDataSource()
