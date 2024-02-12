import { JwtAuth, Pricipal, PricipalDto } from '@aofg/auth';
import {
    Member,
    MemberRepository,
    PeopleService,
    PeoplesModule,
} from '@aofg/peoples';
import { TypeOrmExModule, inTransaction } from '@aofg/typeorm-ext';
import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Injectable,
    InternalServerErrorException,
    Module,
    NotFoundException,
    Param,
    Patch,
    Post,
    Put,
    Query,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DataSource, EntityManager, QueryFailedError } from 'typeorm';
import {
    CommitWorkDto,
    CreateNewGuildDto,
    InviteToGuildDto,
    UpdateMetaDto,
} from './guild.dto';
import { GuildRepository } from './guild.entity';

export * from './guild.entity';

@Injectable()
export class GuildsService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly guilds: GuildRepository,
        private readonly members: MemberRepository,
        private readonly people: PeopleService,
    ) {}

    checkAccess(principal: PricipalDto, slug: string) {
        if (principal.slug !== slug) {
            throw new UnauthorizedException('Invalid guild');
        }
        return this.getGuild(slug).then((guild) => {
            if (guild.salt !== principal.salt) {
                throw new UnauthorizedException('Salt mismatch');
            }
        });
    }

    private async processWork(
        entityManager: EntityManager,
        slug: string,
        externalId: string,
        work: bigint,
        rewardParents: bigint[],
        bonus: boolean
    ) {
        const member = await entityManager.findOne(Member, {
            where: {
                externalId,
                guild: { slug },
            },
            relations: ['guild', 'parent'],
        });

        if (!member) {
            throw new NotFoundException('Member not found');
        }

        console.log(`Processing ${work} work commit for member ${externalId}`);

        if (!bonus) member.work += work;
        else member.referralWork += work;
        member.guild.work += work;

        await entityManager.save(member);
        await entityManager.save(member.guild);

        if (rewardParents && rewardParents.length > 0 && member.parent) {
            const reward = rewardParents.shift()!;
            await this.processWork(
                entityManager,
                slug,
                member.parent.externalId,
                reward,
                rewardParents,
                true
            );
        }

        return member;
    }

    async commitWork(
        slug: string,
        externalId: string,
        work: bigint,
        rewardParents: bigint[]
    ) {
        return inTransaction(this.dataSource, async (entityManager) => {
            const referralDepth = rewardParents.length;

            await this.processWork(
                entityManager,
                slug,
                externalId,
                work,
                rewardParents,
                false
            );

            const relations = [
                'guild',
                ...Array.from(Array(referralDepth), (_, i) =>
                    Array.from(Array(i + 1), () => 'parent').join('.')
                ),
            ];

            console.log(relations);

            return this.members.findOne({
                where: {
                    externalId,
                    guild: { slug },
                },
                relations,
            });
        });
    }

    public async updateMemberMeta(
        slug: string,
        externalId: string,
        meta: Record<string, any>
    ) {
        return inTransaction(this.dataSource, async (entityManager) =>
            this.people.updateMeta(entityManager, slug, externalId, meta)
        );
    }

    public async updateMeta(slug: string, meta: Record<string, any>) {
        const guild = await this.guilds.findOne({
            where: { slug },
        });

        if (!guild) {
            throw new NotFoundException('Guild not found');
        }

        guild.meta = meta;

        return this.guilds.save(guild);
    }

    getMemberReferrals(
        slug: string,
        externalId: string,
        meta?: boolean,
        skip?: number,
        take?: number
    ) {
        return inTransaction(this.dataSource, async (entityManager) =>
            this.people.getReferrals(
                entityManager,
                slug,
                externalId,
                meta,
                skip,
                take
            )
        );
    }

    public async getMember(
        slug: string,
        externalId: string,
        mode?: 'total' | 'personal' | 'referral',
        meta?: boolean,
        guild?: boolean
    ) {
        return inTransaction(this.dataSource, async (entityManager) =>
            this.people.getMember(
                entityManager,
                slug,
                externalId,
                mode,
                meta,
                guild
            )
        );
    }

    public async getGuild(
        slug: string,
        leadersCount?: number,
        mode?: 'total' | 'personal' | 'referral',
        meta?: boolean
    ) {
        const column =
            mode === 'personal'
                ? 'work'
                : mode === 'referral'
                ? 'referralWork'
                : 'totalWork';

        const [guild, leaders] = await Promise.all([
            this.guilds.findOne({ where: { slug } }),
            leadersCount
                ? this.members.find({
                      where: { guild: { slug } },
                      order: { [column]: 'DESC' },
                      take: leadersCount,
                  })
                : Promise.resolve(undefined),
        ]);

        if (!guild) {
            throw new NotFoundException('Guild not found');
        }

        return {
            ...guild,
            leaders,
            meta: meta ? guild?.meta : undefined,
        };
    }

    public async invite(
        slug: string,
        refereeId: string,
        referralId: string,
        referralMeta?: Record<string, unknown>
    ) {
        return inTransaction(this.dataSource, async (entityManager) => {
            const referee = await this.people.getMember(
                entityManager,
                slug,
                refereeId,
                undefined,
                undefined,
                true
            );

            const referral = await this.people.createMember(entityManager, {
                guild: referee.guild,
                parent: referee,
                externalId: referralId,
                meta: referralMeta ?? {},
            });

            referee.referralCount++;

            // update count in referral
            referral.parent = referee;

            return Promise.all([
                entityManager.save(referee),
                entityManager.save(referral),
            ]).then(([_, referral]) => referral);
        }).catch((e) => {
            if (e instanceof QueryFailedError) {
                if (e.message.includes('duplicate key')) {
                    throw new BadRequestException(
                        `Member ${referralId} already exists`
                    );
                }
                throw new InternalServerErrorException(e);
            }
        });
    }

    public async createNew({
        externalId,
        slug,
        guildMeta,
        ownerMeta,
    }: CreateNewGuildDto) {
        return inTransaction(this.dataSource, async (entityManager) => {
            const guild = await this.guilds.createOrUpdateOne(
                { slug, meta: guildMeta },
                entityManager
            );
            const admin = await this.people.createRoot(entityManager, {
                guild,
                externalId,
                meta: ownerMeta,
            });
            guild.members = [admin];

            return entityManager.save(guild);
        }).catch((e) => {
            if (e instanceof QueryFailedError) {
                if (e.message.includes('duplicate key')) {
                    throw new BadRequestException(
                        `Guild ${slug} already exists`
                    );
                }
                throw new InternalServerErrorException(e);
            }
        });
    }
}

@Controller('guilds')
export class GuildsController {
    constructor(private readonly guildService: GuildsService) {}

    @Post('/')
    public createGuild(@Body() dto: CreateNewGuildDto) {
        return this.guildService.createNew(dto);
    }

    @Get('/:slug')
    @ApiOperation({
        description: '',
        summary: 'Get a guild by slug',
    })
    @ApiQuery({
        name: 'leaderboard',
        required: false,
        type: Number,
        example: 10,
        description: 'Amount of leaders to return',
    })
    @ApiQuery({
        name: 'leaderboard-mode',
        description: 'Mode of leaderboard (default: total)',
        required: false,
        type: String,
        enum: ['total', 'personal', 'referral'],
    })
    @ApiParam({
        name: 'slug',
        required: true,
        type: String,
        example: 'guild-42',
        description: 'Slug of the guild',
    })
    @ApiQuery({
        name: 'meta',
        required: false,
        type: Boolean,
        description: 'Include meta data of the guild',
    })
    public getGuild(
        @Param('slug') slug: string,
        @Query('leaderboard') leaderboard?: number,
        @Query('leaderboard-mode') mode?: 'total' | 'personal' | 'referral',
        @Query('meta') meta?: boolean
    ) {
        return this.guildService.getGuild(slug, leaderboard, mode, meta);
    }

    @Get('/:slug/member/:externalId')
    @ApiOperation({
        description: '',
        summary: 'Get member place in leaderboard',
    })
    @ApiParam({
        name: 'slug',
        required: true,
        type: String,
        example: 'guild-42',
        description: 'Slug of the guild',
    })
    @ApiParam({
        name: 'externalId',
        required: true,
        type: String,
        example: '123456',
        description: 'External ID of the member',
    })
    @ApiQuery({
        name: 'mode',
        required: false,
        type: String,
        enum: ['total', 'personal', 'referral'],
        description: 'Mode of leaderboard (default: total)',
    })
    @ApiQuery({
        name: 'meta',
        required: false,
        type: Boolean,
        description: 'Include meta data of the member',
    })
    public getMember(
        @Param('slug') slug: string,
        @Param('externalId') externalId: string,
        @Query('mode') mode: 'total' | 'personal' | 'referral' = 'total',
        @Query('meta') meta?: boolean
    ) {
        return this.guildService.getMember(slug, externalId, mode);
    }

    @JwtAuth()
    @Patch('/:slug/member/:externalId/meta')
    @ApiOperation({
        description: '',
        summary: 'Update member meta',
    })
    @ApiParam({
        name: 'slug',
        required: true,
        type: String,
        example: 'guild-42',
        description: 'Slug of the guild',
    })
    @ApiParam({
        name: 'externalId',
        required: true,
        type: String,
        example: '123456',
        description: 'External ID of the member',
    })
    public async updateMemberMeta(
        @Pricipal() principal: PricipalDto,
        @Param('slug') slug: string,
        @Param('externalId') externalId: string,
        @Body() { meta }: UpdateMetaDto
    ) {
        await this.guildService.checkAccess(principal, slug);
        return this.guildService.updateMemberMeta(slug, externalId, meta);
    }

    @Get('/:slug/member/:externalId/referrals')
    @ApiOperation({
        description: '',
        summary: 'Get member referrals',
    })
    @ApiParam({
        name: 'slug',
        required: true,
        type: String,
        example: 'guild-42',
        description: 'Slug of the guild',
    })
    @ApiParam({
        name: 'externalId',
        required: true,
        type: String,
        example: '123456',
        description: 'External ID of the member',
    })
    @ApiQuery({
        name: 'meta',
        required: false,
        type: Boolean,
        description: 'Include meta data of the member',
    })
    public getMemberReferrals(
        @Param('slug') slug: string,
        @Param('externalId') externalId: string,
        @Query('meta') meta?: boolean
    ) {
        return this.guildService.getMemberReferrals(slug, externalId, meta);
    }

    @Patch('/:slug/member/:externalId/invite')
    @ApiOperation({
        description: '',
        summary: 'Invite a member to guild',
    })
    @ApiParam({
        name: 'slug',
        required: true,
        type: String,
        example: 'guild-42',
        description: 'Slug of the guild',
    })
    @ApiParam({
        name: 'externalId',
        required: true,
        type: String,
        example: '123456',
        description: 'External ID of the member',
    })
    public async inviteToGuild(
        @Pricipal() principal: PricipalDto,
        @Param('slug') slug: string,
        @Param('externalId') externalId: string,
        @Body() dto: InviteToGuildDto
    ) {
        await this.guildService.checkAccess(principal, slug);
        return this.guildService.invite(
            slug,
            externalId,
            dto.referralId,
            dto.referralMeta
        );
    }

    @JwtAuth()
    @Put('/:slug/member/:externalId/work')
    @ApiOperation({
        description: '',
        summary: 'Commit work for member',
    })
    @ApiParam({
        name: 'slug',
        required: true,
        type: String,
        example: 'guild-42',
        description: 'Slug of the guild',
    })
    @ApiParam({
        name: 'externalId',
        required: true,
        type: String,
        example: '123456',
        description: 'External ID of the member',
    })
    public async commitWork(
        @Pricipal() principal: PricipalDto,
        @Param('slug') slug: string,
        @Param('externalId') externalId: string,
        @Body() commit: CommitWorkDto
    ) {
        await this.guildService.checkAccess(principal, slug);

        return this.guildService.commitWork(
            slug,
            externalId,
            BigInt(commit.work),
            commit.rewardParents.map((r) => BigInt(r))
        );
    }
}

@Module({
    imports: [
        TypeOrmExModule.forCustomRepository([
            GuildRepository,
            MemberRepository,
        ]),
        PeoplesModule,
    ],
    controllers: [GuildsController],
    providers: [GuildsService],
    exports: [GuildsService],
})
export class GuildsModule {}
