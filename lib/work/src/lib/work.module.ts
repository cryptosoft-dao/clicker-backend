import { Member, MemberRepository } from '@aofg/peoples';
import { TypeOrmExModule } from '@aofg/typeorm-ext';
import { Injectable, Module, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';

// @Injectable()
// export class WorkService {
//     constructor(private readonly memberRepository: MemberRepository) {}

//     private async processWork(
//         entityManager: EntityManager,
//         slug: string,
//         externalId: string,
//         work: bigint,
//         rewardParents: bigint[],
//         bonus: boolean
//     ) {
//         const member = await entityManager.findOne(Member, {
//             where: {
//                 externalId,
//                 guild: { slug },
//             },
//             relations: ['guild', 'parent'],
//         });

//         if (!member) {
//             throw new NotFoundException('Member not found');
//         }

//         console.log(`Processing ${work} work commit for member ${externalId}`);

//         if (!bonus) member.work += work;
//         else member.referralWork += work;
//         member.guild.work += work;

//         await entityManager.save(member);
//         await entityManager.save(member.guild);

//         if (rewardParents && rewardParents.length > 0 && member.parent) {
//             const reward = rewardParents.shift()!;
//             await this.processWork(
//                 entityManager,
//                 slug,
//                 member.parent.externalId,
//                 reward,
//                 rewardParents,
//                 true
//             );
//         }

//         return member;
//     }

//     async commitWork(
//         entityManager: EntityManager,
//         slug: string,
//         externalId: string,
//         work: bigint,
//         rewardParents: bigint[]
//     ) {
//         const referralDepth = rewardParents.length;

//         await this.processWork(
//             entityManager,
//             slug,
//             externalId,
//             work,
//             rewardParents,
//             false
//         );

//         const relations = [
//             'guild',
//             ...Array.from(Array(referralDepth), (_, i) =>
//                 Array.from(Array(i + 1), () => 'parent').join('.')
//             ),
//         ];

//         console.log(relations);

//         return this.memberRepository.findOne({
//             where: {
//                 externalId,
//                 guild: { slug },
//             },
//             relations,
//         });
//     }
// }

// @Module({
//     imports: [TypeOrmExModule.forCustomRepository([MemberRepository])],
//     providers: [WorkService],
//     exports: [WorkService],
// })
// export class WorkModule {}
