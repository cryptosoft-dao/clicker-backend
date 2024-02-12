import { Body, Controller, Module, Post } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigurationModule, ConfigurationService } from '@aofg/configuration';
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './strategies/jwt.strategy';
import { AdminLoginDto } from './auth.dto';
import { TypeOrmExModule } from '@aofg/typeorm-ext';
import { GuildRepository } from '@aofg/guilds';

export * from './auth.dto'
export * from './decorators'
export * from './auth/auth.service'


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('admin')
    async adminAuth(@Body() admin: AdminLoginDto) {
        return this.authService.adminAuth(admin);
    }
}

@Module({
    imports: [
        ConfigurationModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigurationModule],
            inject: [ConfigurationService],
            useFactory: async (configService: ConfigurationService) => configService.jwt,
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
