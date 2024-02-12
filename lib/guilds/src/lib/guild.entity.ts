import { Member } from '@aofg/peoples';
import { ColumnBigintTransformer, CustomRepository } from '@aofg/typeorm-ext';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';
import { Matches } from 'class-validator';
import {
    Column,
    DeepPartial,
    Entity,
    EntityManager,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
    Repository
} from 'typeorm';

@Entity('Guild')
@Index(['slug', 'salt'], { unique: true })
export class Guild {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({
        description: 'Unique UUID of the guild. Mostly for internal usage'
    })
    @Exclude()
    id!: string;

    @OneToMany('Member', 'guild')
    @ApiProperty({
        description: 'Members of guild'
    })
    members!: Member[];

    @Index()
    @Column('varchar', { length: 10, unique: true })
    @Matches(/^[0-9a-zA-Z\-_]{3,10}$/g)
    @ApiProperty({
        description: 'Unique slug of the guild. Only alphanumeric charaters are allowed with - and _',
        example: 'guild-42'
    })
    slug!: string

    @Column('bigint', {
        transformer: new ColumnBigintTransformer(),
        default: 0n
    })
    @Transform(({ value }) => value.toString(10), { toPlainOnly: true })
    @Transform(({ value }) => BigInt(value), { toClassOnly: true })
    @ApiProperty({
        description: 'Amount of work commited by member'
    })
    work = 0n

    @Column('jsonb')
    @ApiProperty({
        description: 'Meta data of the guild. Mostly for external usage',
        default: {}
    })
    meta: Record<string, unknown> = {}

    @Column({ nullable: true })
    @Exclude()
    lastLogin?: number

    @Column({ nullable: true })
    @Exclude()
    salt?: string
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
