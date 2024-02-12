import {
    IsNumberString,
    IsObject,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNewGuildDto {
    @IsString()
    @ApiProperty({
        description: 'Owner external id',
        example: '123456',
    })
    externalId!: string;

    @Matches(/^[0-9a-zA-Z\-_]{3,10}$/)
    @ApiProperty({
        description:
            'Guild name, 3-10 characters long, only letters, numbers, - and _',
        example: 'guild-42',
    })
    slug!: string;

    @ApiPropertyOptional({
        description: 'Meta data of the guild. Mostly for external usage',
        default: {},
        example: { name: 'Guild 42' },
    })
    @IsObject()
    @IsOptional()
    guildMeta: Record<string, unknown> = {};

    @ApiPropertyOptional({
        description: 'Meta data of the owner. Mostly for external usage',
        default: {},
        example: { name: 'John Doe' },
    })
    @IsObject()
    @IsOptional()
    ownerMeta: Record<string, unknown> = {};
}

export class InviteToGuildDto {
    @IsString()
    @ApiProperty({
        description: 'Referral external id',
        example: '654321',
    })
    referralId!: string;

    @ApiPropertyOptional({
        description: 'Meta data of the referral. Mostly for external usage',
        default: {},
        example: { name: 'John Doe' },
    })
    @IsOptional()
    @IsObject()
    referralMeta: Record<string, unknown> = {};
}

export class UpdateMetaDto {
    @ApiProperty({
        description: 'New meta data',
        default: {},
        example: { name: 'John Doe' },
    })
    @IsObject()
    meta: Record<string, unknown> = {};
}

export class CommitWorkDto {
    @ApiPropertyOptional({
        description:
            'Reward parents of the member. Should be an array of amounts. If not provided, no rewards will be given to parents. If provided, the length of array should be equal to the length of referral system',
        example: ['100', '10', '1'],
        type: 'string',
        isArray: true,
    })
    @IsNumberString({ no_symbols: true }, { each: true })
    rewardParents: string[] = [];

    @ApiProperty({
        description: 'Amount of work to commit',
        example: '1000',
        type: 'string',
    })
    @IsNumberString({ no_symbols: true })
    work!: string;
}
