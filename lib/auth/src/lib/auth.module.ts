import { ConfigurationModule, ConfigurationService } from '@aofg/configuration';
import { Body, Controller, Module, Post } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminLoginDto } from './auth.dto';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

export * from './auth.dto';
export * from './auth/auth.service';
export * from './decorators';

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
            useFactory: async (configService: ConfigurationService) =>
                configService.jwt,
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
