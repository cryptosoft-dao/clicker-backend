import { ConfigurationService } from '@aofg/configuration';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DataSource } from 'typeorm';
import { PricipalDto } from '../auth.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(configService: ConfigurationService) {
        super(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: configService.jwt.secret,
            },
            (
                payload: PricipalDto,
                done: (err: Error | null, payload: PricipalDto | null) => void
            ) => done(null, payload)
        );
    }
}
