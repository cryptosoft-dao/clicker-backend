import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { isObservable, map } from 'rxjs';
import { isPromise } from 'util/types';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
    constructor(private readonly reflector: Reflector) {
        super();
    }

    override canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            'PUBLIC_ROUTE',
            [context.getHandler(), context.getClass()]
        );

        if (isPublic) {
            return true;
        } else {
            return super.canActivate(context);
        }
    }
}
