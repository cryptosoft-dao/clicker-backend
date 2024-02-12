import { ColumnBigintTransformer, CustomRepository } from '@aofg/typeorm-ext'
import { BeforeInsert, BeforeUpdate, Column, DeepPartial, Entity, EntityManager, Index, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Repository, Tree, TreeChildren, TreeParent, Unique } from 'typeorm'
import { Exclude, Expose, Transform } from 'class-transformer'
import { Guild } from '@aofg/guilds'
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Tree('materialized-path')
@Unique('guild-external-id', ['guildId', 'externalId'])
@Index(['guild', 'externalId'])
export class Member {
    @PrimaryGeneratedColumn('uuid')
    @Exclude()
    id!: string;

    @TreeParent()
    parent?: Member

    @TreeChildren()
    children!: Member[] 

    @Index()
    @Column('bigint', {
        transformer: new ColumnBigintTransformer(),
        default: 0n
    })
    @Transform(({ value }) => value.toString(10), { toPlainOnly: true })
    @Transform(({ value }) => BigInt(value), { toClassOnly: true })
    @ApiProperty({
        description: 'Amount of work commited by member'
    })
    work: bigint = 0n

    @Index()
    @Column('bigint', {
        transformer: new ColumnBigintTransformer(),
        default: 0n
    })
    @Transform(({ value }) => value.toString(10), { toPlainOnly: true })
    @Transform(({ value }) => BigInt(value), { toClassOnly: true })
    @ApiProperty({
        description: 'Amount of work earned by member from referrals'
    })
    referralWork: bigint = 0n

    @ManyToOne(() => Guild, (guild) => guild.members)
    @JoinTable({ name: 'guildId' })
    guild!: Guild

    @Index()
    @Column('uuid')
    guildId!: string


    @Index()
    @Column('varchar')
    @ApiProperty({
        description: 'External ID of member to map on integration. Should be unique for each member in guild'
    })
    externalId!: string;

    @Index()
    @Column('bigint', {
        transformer: new ColumnBigintTransformer(),
        default: 0n
    })
    @Transform(({ value }) => value.toString(10), { toPlainOnly: true })
    @Transform(({ value }) => BigInt(value), { toClassOnly: true })
    @ApiProperty({
        description: 'Total amount of work commited by member and its referrals'
    })
    totalWork: bigint = 0n

    @Column('jsonb')
    @ApiProperty({
        description: 'Meta data of the member. Mostly for external usage',
        default: {}
    })
    meta: Record<string, unknown> = {}

    @Column()
    @ApiProperty({
        description: 'Amount of referrals invited by member',
        default: 0
    })
    referralCount: number = 0
    
    @BeforeInsert()
    @BeforeUpdate()
    updateTotalWork() {
        this.totalWork = this.work + this.referralWork
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
