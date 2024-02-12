import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class PricipalDto {
    @ApiProperty({
        description: 'The slug of guild',
    })
    slug!: string;

    @ApiProperty({
        description: 'The salt of guild',
    })
    salt!: string;
}

export class AdminLoginDto {
    @ApiProperty({
        description: 'The admin password',
    })
    @IsString()
    password!: string;

    @ApiProperty({
        description: 'The guild slug',
    })
    @Matches(/^[a-z0-9-_]{3,10}$/)
    slug!: string;
}
