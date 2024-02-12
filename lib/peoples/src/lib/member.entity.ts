import { ColumnBigintTransformer, CustomRepository } from '@aofg/typeorm-ext';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';
import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    DeepPartial,
    Entity,
    EntityManager,
    Index,
    JoinTable,
    ManyToOne,
    PrimaryGeneratedColumn,
    Repository,
    Tree,
    TreeChildren,
    TreeParent,
    Unique,
} from 'typeorm';

type GuildLike = {
    id: string;
    slug: string;
    work: bigint;
    meta: Record<string, unknown>;
};

@Entity('Member')
@Tree('materialized-path')
@Unique('guild-external-id', ['guildId', 'externalId'])
@Index(['guild', 'externalId'])
export class Member {
    @PrimaryGeneratedColumn('uuid')
    @Exclude()
    id!: string;

    @TreeParent()
    parent?: Member;

    @TreeChildren()
    children!: Member[];

    @Index()
    @Column('bigint', {
        transformer: new ColumnBigintTransformer(),
        default: 0n,
    })
    @Transform(({ value }) => value.toString(10), { toPlainOnly: true })
    @Transform(({ value }) => BigInt(value), { toClassOnly: true })
    @ApiProperty({
        description: 'Amount of work commited by member',
    })
    work = 0n;

    @Index()
    @Column('bigint', {
        transformer: new ColumnBigintTransformer(),
        default: 0n,
    })
    @Transform(({ value }) => value.toString(10), { toPlainOnly: true })
    @Transform(({ value }) => BigInt(value), { toClassOnly: true })
    @ApiProperty({
        description: 'Amount of work earned by member from referrals',
    })
    referralWork = 0n;

    @ManyToOne('Guild', 'members')
    @JoinTable({ name: 'guildId' })
    guild!: GuildLike;

    @Index()
    @Column('uuid')
    guildId!: string;

    @Index()
    @Column('varchar')
    @ApiProperty({
        description:
            'External ID of member to map on integration. Should be unique for each member in guild',
    })
    externalId!: string;

    @Index()
    @Column('bigint', {
        transformer: new ColumnBigintTransformer(),
        default: 0n,
    })
    @Transform(({ value }) => value.toString(10), { toPlainOnly: true })
    @Transform(({ value }) => BigInt(value), { toClassOnly: true })
    @ApiProperty({
        description:
            'Total amount of work commited by member and its referrals',
    })
    totalWork = 0n;

    @Column('jsonb')
    @ApiProperty({
        description: 'Meta data of the member. Mostly for external usage',
        default: {},
    })
    meta: Record<string, unknown> = {};

    @Column('integer', { default: 0 })
    @ApiProperty({
        description: 'Amount of referrals invited by member',
        default: 0,
    })
    referralCount = 0;

    @BeforeInsert()
    @BeforeUpdate()
    updateTotalWork() {
        this.totalWork = this.work + this.referralWork;
    }
}

@CustomRepository(Member)
export class MemberRepository extends Repository<Member> {
    createOrUpdateOne(
        entityLike: DeepPartial<Member>,
        entityManager?: EntityManager
    ): Promise<Member> {
        const entity = this.create(entityLike);
        return entityManager ? entityManager.save(entity) : this.save(entity);
    }
}
