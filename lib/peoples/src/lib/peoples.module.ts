import {
    Controller,
    Injectable,
    Module,
    NotFoundException,
    Post,
} from '@nestjs/common';
import { Member, MemberRepository } from './member.entity';
import { Guild } from '@aofg/guilds';
import { TypeOrmExModule } from '@aofg/typeorm-ext';
import { EntityManager, FindOneOptions, MoreThanOrEqual } from 'typeorm';
export * from './member.entity';

@Injectable()
export class PeopleService {
    public async getMember(
        entityManager: EntityManager,
        slug: string,
        externalId: string,
        mode?: 'total' | 'personal' | 'referral',
        meta?: boolean,
        guild?: boolean
    ) {
        const member = await entityManager.findOne(Member, {
            where: { guild: { slug }, externalId },
            relations: guild ? ['guild'] : [],
        });

        if (!member) {
            throw new NotFoundException('Member not found');
        }

        const column =
            mode === 'personal'
                ? ('work' as const)
                : mode === 'referral'
                ? ('referralWork' as const)
                : ('totalWork' as const);

        const place = meta
            ? await entityManager.count(Member, {
                  where: {
                      guild: { slug },
                      [column]: MoreThanOrEqual(member[column]),
                  },
              })
            : undefined;

        return Object.assign(member, {
            place,
            meta: meta ? member.meta : undefined,
        });
    }
    constructor(private readonly members: MemberRepository) {}

    createMember(
        entityManager: EntityManager,
        dto: Pick<Member, 'guild' | 'parent' | 'externalId' | 'meta'>
    ) {
        return this.members.createOrUpdateOne(dto, entityManager);
    }

    createRoot(
        entityManager: EntityManager,
        dto: Pick<Member, 'guild' | 'externalId' | 'meta'>
    ) {
        return this.members.createOrUpdateOne(dto, entityManager);
    }

    public async updateMeta(
        entityManager: EntityManager,
        slug: string,
        externalId: string,
        meta: Record<string, any>
    ) {
        const member = await entityManager.findOne(Member, {
            where: { guild: { slug }, externalId },
        });

        if (!member) {
            throw new NotFoundException('Member not found');
        }

        member.meta = meta;

        return entityManager.save(member);
    }

    async getReferrals(
        entityManager: EntityManager,
        slug: string,
        externalId: string,
        meta: boolean | undefined,
        skip: number | undefined,
        take: number | undefined
    ) {
        const member = await entityManager.findOne(Member, {
            where: { guild: { slug }, externalId },
        });

        if (!member) {
            throw new NotFoundException('Member not found');
        }

        return entityManager
            .find(Member, {
                where: { parent: member },
                order: { totalWork: 'DESC', referralCount: 'DESC' },
                skip,
                take,
            })
            .then((referrals) =>
                referrals.map((child) =>
                    Object.assign(child, {
                        meta: meta ? child.meta : undefined,
                    })
                )
            );
    }
}

@Module({
    imports: [TypeOrmExModule.forCustomRepository([MemberRepository])],
    providers: [PeopleService],
    exports: [PeopleService],
})
export class PeoplesModule {}
