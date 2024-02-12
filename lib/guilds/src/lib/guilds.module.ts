import { defined } from '@aofg/helpers';
import { MemberRepository, PeopleService, PeoplesModule } from '@aofg/peoples';
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
import { DataSource, FindOneOptions, QueryFailedError } from 'typeorm';
import {
    CommitWorkDto,
    CreateNewGuildDto,
    InviteToGuildDto,
    UpdateMetaDto,
} from './guild.dto';
import { Guild, GuildRepository } from './guild.entity';
import { MoreThanOrEqual } from 'typeorm';
import { WorkModule, WorkService } from '@aofg/work';
import { JwtAuth, Pricipal, PricipalDto } from '@aofg/auth';

export * from './guild.entity';

@Injectable()
export class GuildsService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly guilds: GuildRepository,
        private readonly members: MemberRepository,
        private readonly people: PeopleService,
        private readonly work: WorkService
    ) {}

    public async commitWork(
        slug: string,
        externalId: string,
        commit: CommitWorkDto
    ) {
        return inTransaction(this.dataSource, (entityManager) =>
            this.work.commitWork(
                entityManager,
                slug,
                externalId,
                BigInt(commit.work),
                commit.rewardParents.map(BigInt)
            )
        );
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
    public updateMemberMeta(
        @Pricipal() principal: PricipalDto,
        @Param('slug') slug: string,
        @Param('externalId') externalId: string,
        @Body() { meta }: UpdateMetaDto
    ) {
        if (principal.slug !== slug) {
            throw new UnauthorizedException('Invalid guild');
        }
        
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
    public inviteToGuild(
        @Pricipal() principal: PricipalDto,
        @Param('slug') slug: string,
        @Param('externalId') externalId: string,
        @Body() dto: InviteToGuildDto
    ) {
        if (principal.slug !== slug) {
            throw new UnauthorizedException('Invalid guild');
        }
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
    public commitWork(
        @Pricipal() principal: PricipalDto,
        @Param('slug') slug: string,
        @Param('externalId') externalId: string,
        @Body() commit: CommitWorkDto
    ) {
        if (principal.slug !== slug) {
            throw new UnauthorizedException('Invalid guild');
        }

        return this.guildService.commitWork(slug, externalId, commit);
    }
}

@Module({
    imports: [
        TypeOrmExModule.forCustomRepository([
            GuildRepository,
            MemberRepository,
        ]),
        PeoplesModule,
        WorkModule,
    ],
    controllers: [GuildsController],
    providers: [GuildsService],
    exports: [GuildsService],
})
export class GuildsModule {}
