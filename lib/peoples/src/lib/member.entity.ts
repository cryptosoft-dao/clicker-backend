import { ColumnBigintTransformer } from '@aofg/typeorm-ext'
import { Column, Entity, Index, JoinTable, ManyToMany, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent } from 'typeorm'
import { Transform } from 'class-transformer'
import { Guild } from '@aofg/guilds'

@Entity()
@Tree('materialized-path')
export class Member {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @TreeParent()
    parent!: Member

    @TreeChildren()
    children!: Member[]

    @Column('bigint', {
        transformer: new ColumnBigintTransformer()
    })
    @Index()
    @Transform(({ value }) => value.toString(10), { toPlainOnly: true })
    work!: bigint

    @ManyToMany(() => Guild, (guild) => guild.members)
    @JoinTable()
    guilds!: Guild[]
}