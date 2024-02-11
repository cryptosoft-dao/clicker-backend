import { Member } from '@aofg/peoples';
import { CustomRepository } from '@aofg/typeorm-ext';
import {
  DeepPartial,
  Entity,
  EntityManager,
  ManyToMany,
  PrimaryGeneratedColumn,
  Repository
} from 'typeorm';

@Entity()
export class Guild {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToMany(() => Member, (member) => member.guilds)
    members!: Member[];
}

@CustomRepository(Guild)
export class GuildRepository extends Repository<Guild> {
    createOrUpdateOne(
        entityLike: DeepPartial<Guild>,
        entityManager?: EntityManager
    ): Promise<Guild> {
        const entity = this.create(entityLike);
        return entityManager ? entityManager.save(entity) : this.save(entity);
    }
}
