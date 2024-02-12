import { config as dotenv } from 'dotenv';
import { DataSource } from 'typeorm';
import * as migrations from './migrations';
import * as entities from './entities';

dotenv();

export default new DataSource({
    type: 'postgres',
    host: process.env['DB_HOST'],
    port: parseInt(process.env['DB_PORT']!),
    username: process.env['DB_USERNAME'],
    password: process.env['DB_PASSWORD'],
    database: process.env['DB_DATABASE'],
    ssl: false,
    entities,
    migrations,
    synchronize: false,
    migrationsTableName: 'migrations',
    migrationsRun: true,
});
