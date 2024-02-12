import { DataSource, EntityManager, TreeRepository } from 'typeorm';

import {
    DynamicModule,
    InternalServerErrorException,
    Provider,
} from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { SetMetadata } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';

export const TYPEORM_EX_CUSTOM_REPOSITORY = 'TYPEORM_EX_CUSTOM_REPOSITORY';

export function CustomRepository<T>(entity: ClassConstructor<T>): ClassDecorator {
    return SetMetadata(TYPEORM_EX_CUSTOM_REPOSITORY, entity);
}

export class TypeOrmExModule {
    public static forCustomRepository<T extends new (...args: any[]) => any>(
        repositories: T[]
    ): DynamicModule {
        const providers: Provider[] = [];

        for (const repository of repositories) {
            const entity = Reflect.getMetadata(
                TYPEORM_EX_CUSTOM_REPOSITORY,
                repository
            );

            if (!entity) {
                continue;
            }

            providers.push({
                inject: [getDataSourceToken()],
                provide: repository,
                useFactory: (dataSource: DataSource): typeof repository => {
                    const baseRepository =
                        repository.prototype instanceof TreeRepository
                            ? dataSource.getTreeRepository(entity)
                            : dataSource.getRepository(entity);
                    return new repository(
                        baseRepository.target,
                        baseRepository.manager,
                        baseRepository.queryRunner
                    );
                },
            });
        }

        return {
            exports: providers,
            module: TypeOrmExModule,
            providers,
        };
    }
}

export class ColumnBigintTransformer {
    public to(data?: bigint): string | undefined {
        return data?.toString(10);
    }

    public from(data?: string): bigint | undefined {
        return typeof data === 'undefined' || data === null
            ? undefined
            : BigInt(data);
    }
}

export const inTransaction = async <T>(
    ds: DataSource,
    func: (entityManager: EntityManager) => Promise<T>
) => {
    const queryRunner = ds.createQueryRunner();
    try {
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const entityManager = queryRunner.manager;

        return await func(entityManager).then((r) => {
            return queryRunner
                .commitTransaction()
                .then(() => queryRunner.release())
                .then(() => r);
        });
    } catch (error) {
        queryRunner.isTransactionActive &&
            (await queryRunner.rollbackTransaction());
        console.error('Create key transaction', error);
        throw error;
    } finally {
        await queryRunner.release();
    }
};
