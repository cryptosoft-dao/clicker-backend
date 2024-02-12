import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminLoginDto } from '../auth.dto';
import { ConfigurationService } from '@aofg/configuration';
import { inTransaction } from '@aofg/typeorm-ext';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly configService: ConfigurationService,
        private readonly jwtService: JwtService
    ) {}

    adminAuth({ slug, password }: AdminLoginDto) {
        if (password !== this.configService.admin.password) {
            throw new UnauthorizedException('Invalid password');
        }

        const salt = Math.random().toString(32).substring(2);

        return inTransaction(this.dataSource, async (manager) =>
            manager.update(
                'Guild',
                { slug },
                { lastLogin: Math.floor(new Date().getTime() / 1000), salt }
            )
        ).then(() => ({
            token: this.jwtService.sign(
                { slug, salt },
                {
                    secret: this.configService.jwt.secret,
                }
            ),
        }));
    }
}
