import { ConfigurationService } from '@aofg/configuration';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PricipalDto } from '../auth.dto';
import { DataSource } from 'typeorm';
import { inTransaction } from '@aofg/typeorm-ext';
import { Guild } from '@aofg/guilds';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        configService: ConfigurationService,
        private readonly dataSources: DataSource
    ) {
        super(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: configService.jwt.secret,
            },
            async (
                payload: PricipalDto,
                done: (err: Error | null, payload: PricipalDto | null) => void
            ) =>
                this.verify(payload)
                    .then(() => done(null, payload))
                    .catch((e) => done(e, null))
        );
    }

    async verify({ slug, salt }: PricipalDto) {
        return inTransaction(this.dataSources, (manager) =>
            manager.count(Guild, { where: { slug, salt } }).then((count) => {
                if (count === 0) {
                    throw new Error('Invalid token');
                }
            })
        );
    }
}
