import { DataSource, TreeRepository } from 'typeorm';

import { DynamicModule, Provider } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { SetMetadata } from '@nestjs/common';

export const TYPEORM_EX_CUSTOM_REPOSITORY = 'TYPEORM_EX_CUSTOM_REPOSITORY';

export function CustomRepository(entity: Function): ClassDecorator {
  return SetMetadata(TYPEORM_EX_CUSTOM_REPOSITORY, entity);
}

export class TypeOrmExModule {
  public static forCustomRepository<T extends new (...args: any[]) => any>(repositories: T[]): DynamicModule {
    const providers: Provider[] = [];

    for (const repository of repositories) {
      const entity = Reflect.getMetadata(TYPEORM_EX_CUSTOM_REPOSITORY, repository);

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
          return new repository(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
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
    public to(data: bigint): string {
        return data.toString(10);
    }

    public from(data: string): bigint {
        return BigInt(data);
    }
}

